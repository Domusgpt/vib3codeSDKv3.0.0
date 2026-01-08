/**
 * VIB3+ Agent Module
 * Agentic integration layer with MCP server and telemetry
 */

// Telemetry
export {
    TelemetryService,
    TelemetrySpan,
    EventType,
    SpanStatus,
    withTelemetry,
    withTelemetrySync,
    telemetry
} from './telemetry/index.js';

// MCP
export {
    MCPServer,
    mcpServer,
    toolDefinitions,
    getToolList,
    getToolNames,
    getTool,
    validateToolInput
} from './mcp/index.js';

// Default exports
export { telemetry } from './telemetry/index.js';
export { mcpServer } from './mcp/index.js';
