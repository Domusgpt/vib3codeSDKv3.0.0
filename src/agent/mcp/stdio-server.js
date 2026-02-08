#!/usr/bin/env node
/**
 * VIB3+ MCP Server — JSON-RPC 2.0 over stdio
 *
 * Implements the Model Context Protocol so any MCP client (Claude Desktop,
 * Cursor, custom agents) can control VIB3+ programmatically.
 *
 * Usage:
 *   node src/agent/mcp/stdio-server.js
 *
 * Or via package.json bin:
 *   vib3-mcp
 */

import { createInterface } from 'readline';
import { MCPServer } from './MCPServer.js';
import { getToolList } from './tools.js';

const SERVER_INFO = {
    name: 'vib3-mcp',
    version: '2.0.2',
    description: 'VIB3+ 4D Visualization MCP Server — 3 systems, 24 geometries, 6D rotation'
};

// ── JSON-RPC helpers ──

function jsonrpc(id, result) {
    return JSON.stringify({ jsonrpc: '2.0', id, result });
}

function jsonrpcError(id, code, message, data) {
    const err = { jsonrpc: '2.0', id, error: { code, message } };
    if (data !== undefined) err.error.data = data;
    return JSON.stringify(err);
}

function jsonrpcNotification(method, params) {
    return JSON.stringify({ jsonrpc: '2.0', method, params });
}

// ── MCP Protocol implementation ──

class VIB3StdioMCP {
    constructor() {
        this.server = new MCPServer();
        this.initialized = false;
    }

    async handleMessage(raw) {
        let msg;
        try {
            msg = JSON.parse(raw);
        } catch {
            return jsonrpcError(null, -32700, 'Parse error');
        }

        if (msg.jsonrpc !== '2.0') {
            return jsonrpcError(msg.id ?? null, -32600, 'Invalid Request: missing jsonrpc 2.0');
        }

        const { id, method, params } = msg;

        switch (method) {
            case 'initialize':
                return this.handleInitialize(id, params);
            case 'initialized':
                return null; // Notification, no response
            case 'tools/list':
                return this.handleToolsList(id);
            case 'tools/call':
                return await this.handleToolsCall(id, params);
            case 'resources/list':
                return this.handleResourcesList(id);
            case 'resources/read':
                return await this.handleResourcesRead(id, params);
            case 'ping':
                return jsonrpc(id, {});
            default:
                return jsonrpcError(id, -32601, `Method not found: ${method}`);
        }
    }

    handleInitialize(id, params) {
        this.initialized = true;

        return jsonrpc(id, {
            protocolVersion: '2024-11-05',
            capabilities: {
                tools: {},
                resources: { subscribe: false, listChanged: false }
            },
            serverInfo: SERVER_INFO
        });
    }

    handleToolsList(id) {
        const tools = getToolList().map(t => ({
            name: t.name,
            description: t.description,
            inputSchema: t.inputSchema
        }));

        return jsonrpc(id, { tools });
    }

    async handleToolsCall(id, params) {
        if (!params?.name) {
            return jsonrpcError(id, -32602, 'Invalid params: missing tool name');
        }

        const { name, arguments: args = {} } = params;

        try {
            const result = await this.server.handleToolCall(name, args);

            return jsonrpc(id, {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(result, null, 2)
                    }
                ],
                isError: !result.success
            });
        } catch (error) {
            return jsonrpc(id, {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            success: false,
                            error: error.message
                        })
                    }
                ],
                isError: true
            });
        }
    }

    handleResourcesList(id) {
        return jsonrpc(id, {
            resources: [
                {
                    uri: 'vib3://docs/claude-md',
                    name: 'CLAUDE.md',
                    description: 'Full VIB3+ SDK technical reference for AI agents',
                    mimeType: 'text/markdown'
                },
                {
                    uri: 'vib3://docs/geometry-summary',
                    name: '24 Geometry + 6D Rotation Summary',
                    description: 'Complete geometry encoding and rotation plane reference',
                    mimeType: 'text/markdown'
                },
                {
                    uri: 'vib3://docs/control-reference',
                    name: 'Control Reference',
                    description: 'Parameter ranges, keyboard shortcuts, API reference',
                    mimeType: 'text/markdown'
                },
                {
                    uri: 'vib3://state/current',
                    name: 'Current Engine State',
                    description: 'Live engine state (system, geometry, parameters, rotation)',
                    mimeType: 'application/json'
                }
            ]
        });
    }

    async handleResourcesRead(id, params) {
        if (!params?.uri) {
            return jsonrpcError(id, -32602, 'Invalid params: missing uri');
        }

        const { uri } = params;

        try {
            let content;
            let mimeType = 'text/markdown';

            switch (uri) {
                case 'vib3://docs/claude-md':
                    content = await this._readFile('CLAUDE.md');
                    break;
                case 'vib3://docs/geometry-summary':
                    content = await this._readFile('24-GEOMETRY-6D-ROTATION-SUMMARY.md');
                    break;
                case 'vib3://docs/control-reference':
                    content = await this._readFile('DOCS/CONTROL_REFERENCE.md');
                    break;
                case 'vib3://state/current':
                    content = JSON.stringify(this.server.getState(), null, 2);
                    mimeType = 'application/json';
                    break;
                default:
                    return jsonrpcError(id, -32602, `Unknown resource: ${uri}`);
            }

            return jsonrpc(id, {
                contents: [{ uri, mimeType, text: content }]
            });
        } catch (error) {
            return jsonrpcError(id, -32603, `Resource read failed: ${error.message}`);
        }
    }

    async _readFile(relativePath) {
        const { readFile } = await import('fs/promises');
        const { resolve, dirname } = await import('path');
        const { fileURLToPath } = await import('url');

        // Resolve relative to project root (3 levels up from src/agent/mcp/)
        const __dirname = dirname(fileURLToPath(import.meta.url));
        const projectRoot = resolve(__dirname, '..', '..', '..');
        const filePath = resolve(projectRoot, relativePath);

        return readFile(filePath, 'utf-8');
    }
}

// ── Main: stdio transport ──

async function main() {
    const mcp = new VIB3StdioMCP();

    const rl = createInterface({
        input: process.stdin,
        terminal: false
    });

    // Log to stderr so stdout stays clean for JSON-RPC
    const log = (msg) => process.stderr.write(`[vib3-mcp] ${msg}\n`);

    log(`VIB3+ MCP Server v${SERVER_INFO.version} starting on stdio`);

    rl.on('line', async (line) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        try {
            const response = await mcp.handleMessage(trimmed);
            if (response !== null) {
                process.stdout.write(response + '\n');
            }
        } catch (error) {
            log(`Error: ${error.message}`);
            process.stdout.write(
                jsonrpcError(null, -32603, `Internal error: ${error.message}`) + '\n'
            );
        }
    });

    rl.on('close', () => {
        log('stdin closed, shutting down');
        process.exit(0);
    });
}

main().catch((err) => {
    process.stderr.write(`[vib3-mcp] Fatal: ${err.message}\n`);
    process.exit(1);
});
