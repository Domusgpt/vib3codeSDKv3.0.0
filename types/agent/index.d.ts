/**
 * VIB3+ SDK Agent Module Type Definitions
 * @module @vib3code/sdk/agent
 */

// ─── Re-exports ───
export { MCPServer, mcpServer, toolDefinitions, getToolList, getToolNames, getTool, validateToolInput } from './mcp';
export { AgentCLI, BatchExecutor, CommandType, ResponseStatus, createStreamingCLI } from './cli';
export {
    TelemetryService, TelemetrySpan, EventType, SpanStatus,
    withTelemetry, withTelemetrySync, telemetry,
    PrometheusExporter, JSONExporter, NDJSONExporter, ConsoleExporter, createExporter,
    StreamEventType, EventStreamServer, EventStreamClient, SSEConnection,
    createSSEHandler, connectTelemetryToStream,
    configureTelemetry, getTelemetry, trace, traceFunction,
    traceAsyncIterable, instrumentClass, traceObject, withTiming,
    meter, traceBatch, TraceContext
} from './telemetry';
