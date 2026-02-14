/**
 * VIB3+ Agent CLI Type Definitions
 */
import { EventEmitter } from 'events';

export declare const CommandType: {
    SET_PARAMETER: 'set_parameter';
    GET_PARAMETER: 'get_parameter';
    SET_GEOMETRY: 'set_geometry';
    SET_SYSTEM: 'set_system';
    ROTATE: 'rotate';
    RESET_ROTATION: 'reset_rotation';
    BATCH: 'batch';
    BATCH_ROTATE: 'batch_rotate';
    GET_METRICS: 'get_metrics';
    GET_SPANS: 'get_spans';
    FLUSH_TELEMETRY: 'flush_telemetry';
    PING: 'ping';
    STATUS: 'status';
    HELP: 'help';
    QUIT: 'quit';
};

export declare const ResponseStatus: {
    OK: 'ok';
    ERROR: 'error';
    PARTIAL: 'partial';
};

export interface CLIOptions {
    inputStream?: NodeJS.ReadableStream;
    outputStream?: NodeJS.WritableStream;
    errorStream?: NodeJS.WritableStream;
    format?: 'jsonl' | 'json' | 'text';
    pretty?: boolean;
    enableTelemetry?: boolean;
}

export interface CLICommand {
    type: string;
    id?: string;
    [key: string]: any;
}

export interface CLIResponse {
    id?: string;
    status: 'ok' | 'error' | 'partial';
    result?: any;
    error?: string;
    durationMs?: number;
}

export class AgentCLI extends EventEmitter {
    engine: any;
    options: CLIOptions;
    constructor(engine: any, options?: CLIOptions);
    start(): void;
    stop(): void;
    registerHandler(type: string, handler: (command: CLICommand) => any | Promise<any>): void;
    execute(command: CLICommand): Promise<any>;
}

export class BatchExecutor {
    cli: AgentCLI;
    queue: CLICommand[];
    results: Array<{ status: string; command: string; result?: any; error?: string }>;
    constructor(cli: AgentCLI);
    add(command: CLICommand): this;
    execute(): Promise<Array<{ status: string; command: string; result?: any; error?: string }>>;
    executeParallel(): Promise<Array<{ status: string; command: string; result?: any; error?: string }>>;
}

export interface StreamingCLIResult {
    cli: AgentCLI;
    streamServer: any;
}

export function createStreamingCLI(engine: any, httpServer: any, options?: CLIOptions): StreamingCLIResult;
