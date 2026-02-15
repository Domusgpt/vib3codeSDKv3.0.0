/**
 * VIB3+ Telemetry Type Definitions
 */
import { EventEmitter } from 'events';

// ─── Event Types ───

export declare const EventType: {
    TOOL_INVOCATION: string;
    TOOL_ERROR: string;
    SYSTEM_SWITCH: string;
    PARAMETER_CHANGE: string;
    RENDER_FRAME: string;
    AUDIO_UPDATE: string;
    ERROR: string;
    LIFECYCLE: string;
    PERFORMANCE: string;
};

export declare const SpanStatus: {
    UNSET: 'unset';
    OK: 'ok';
    ERROR: 'error';
};

// ─── TelemetrySpan ───

export interface SpanEvent {
    name: string;
    timestamp: number;
    attributes: Record<string, any>;
}

export class TelemetrySpan {
    name: string;
    traceId: string;
    spanId: string;
    parentSpanId: string | null;
    startTime: number;
    endTime: number | null;
    duration: number | null;
    status: string;
    statusMessage: string | null;
    attributes: Record<string, any>;
    events: SpanEvent[];

    constructor(name: string, traceId: string, parentSpanId?: string | null, attributes?: Record<string, any>);
    addEvent(name: string, attributes?: Record<string, any>): void;
    setAttribute(key: string, value: any): void;
    setAttributes(attrs: Record<string, any>): void;
    setStatus(status: string, message?: string | null): void;
    end(): void;
    toJSON(): Record<string, any>;
}

// ─── TelemetryService ───

export interface TelemetryOptions {
    maxSpans?: number;
    maxEvents?: number;
    flushIntervalMs?: number;
    enabled?: boolean;
}

export interface TelemetryMetrics {
    spans_total: number;
    events_total: number;
    errors_total: number;
    tool_invocations: number;
    render_frames: number;
    [key: string]: number;
}

export class TelemetryService {
    constructor(options?: TelemetryOptions);
    startTrace(): string;
    getTraceId(): string;
    createSpan(name: string, attributes?: Record<string, any>, parentSpanId?: string | null): TelemetrySpan;
    recordSpan(span: TelemetrySpan): void;
    recordEvent(type: string, attributes?: Record<string, any>): void;
    subscribe(eventType: string, callback: (data: any) => void): () => void;
    emit(eventType: string, data: any): void;
    flush(): { spans: any[]; events: any[]; metrics: TelemetryMetrics };
    getMetrics(): TelemetryMetrics;
    getSpans(): TelemetrySpan[];
    resetMetrics(): void;
    setEnabled(enabled: boolean): void;
    destroy(): void;
}

export const telemetry: TelemetryService;

export function withTelemetry<T>(service: TelemetryService, operationName: string, fn: (span: TelemetrySpan) => Promise<T>, attributes?: Record<string, any>): Promise<T>;
export function withTelemetrySync<T>(service: TelemetryService, operationName: string, fn: (span: TelemetrySpan) => T, attributes?: Record<string, any>): T;

// ─── Exporters ───

export class PrometheusExporter {
    export(metrics: TelemetryMetrics): string;
}

export class JSONExporter {
    export(data: any): string;
}

export class NDJSONExporter {
    export(data: any[]): string;
}

export class ConsoleExporter {
    export(data: any): void;
}

export function createExporter(type: 'prometheus' | 'json' | 'ndjson' | 'console', options?: Record<string, any>): PrometheusExporter | JSONExporter | NDJSONExporter | ConsoleExporter;

// ─── Event Streaming ───

export declare const StreamEventType: {
    SPAN_START: string;
    SPAN_END: string;
    METRIC: string;
    ERROR: string;
    HEARTBEAT: string;
    TELEMETRY: string;
};

export interface StreamEvent {
    type: string;
    data: any;
    id?: string;
    channel?: string;
    timestamp?: number;
}

export class EventStreamServer extends EventEmitter {
    constructor(options?: { heartbeatIntervalMs?: number; maxReplayBuffer?: number; channels?: string[] });
    handleConnection(req: any, res: any, options?: { channel?: string; filters?: string[] }): void;
    broadcast(event: StreamEvent, channel?: string): void;
    sendTo(connectionId: string, event: StreamEvent): void;
    streamTelemetry(telemetryEvent: any): void;
    streamSpanStart(span: TelemetrySpan): void;
    streamSpanEnd(span: TelemetrySpan): void;
    streamMetric(name: string, value: number, labels?: Record<string, string>): void;
    streamError(error: Error): void;
    getConnectionIds(): string[];
    closeConnection(connectionId: string): void;
    close(): void;
}

export class SSEConnection {
    id: string;
    constructor(options: { req: any; res: any; channel?: string; filters?: string[] });
    send(event: StreamEvent): void;
    matchesChannel(channel: string): boolean;
    matchesFilters(event: StreamEvent): boolean;
    close(): void;
}

export class EventStreamClient extends EventEmitter {
    constructor(url: string, options?: { autoReconnect?: boolean; maxRetries?: number; retryDelayMs?: number });
    connect(): void;
    disconnect(): void;
}

export function createSSEHandler(server: EventStreamServer): (req: any, res: any) => void;
export function connectTelemetryToStream(telemetryService: TelemetryService, streamServer: EventStreamServer): void;

// ─── Instrumentation ───

export function configureTelemetry(telemetryService: TelemetryService): void;
export function getTelemetry(): TelemetryService;

export interface TraceOptions {
    attributes?: Record<string, any>;
    recordArgs?: boolean;
    recordResult?: boolean;
}

export function trace(spanName: string, options?: TraceOptions): MethodDecorator;
export function traceFunction<T extends (...args: any[]) => any>(fn: T, name?: string, options?: TraceOptions): T;
export function traceAsyncIterable<T>(iterable: AsyncIterable<T>, name: string, options?: TraceOptions): AsyncIterable<T>;
export function instrumentClass(ClassConstructor: new (...args: any[]) => any, options?: { methods?: string[]; exclude?: string[] }): void;
export function traceObject(target: Record<string, any>, name: string, options?: { methods?: string[] }): Record<string, any>;
export function withTiming<T>(fn: () => T, callback: (durationMs: number) => void): T;
export function meter(metricName: string, options?: { unit?: string; description?: string }): (value: number, labels?: Record<string, string>) => void;
export function traceBatch(operations: Array<() => any>, name: string): Promise<any[]>;

export class TraceContext {
    constructor(telemetry: TelemetryService);
}
