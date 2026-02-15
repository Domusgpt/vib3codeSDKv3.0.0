/**
 * VIB3+ MCP Server Type Definitions
 */

export interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: Record<string, any>;
}

export interface ToolResponse {
    success: boolean;
    operation: string;
    timestamp: string;
    duration_ms?: number;
    error?: {
        type: string;
        code: string;
        message: string;
        suggestion?: string;
    };
    [key: string]: any;
}

export interface RotationArgs {
    XY?: number;
    XZ?: number;
    YZ?: number;
    XW?: number;
    YW?: number;
    ZW?: number;
}

export interface VisualParameterArgs {
    hue?: number;
    saturation?: number;
    intensity?: number;
    speed?: number;
    chaos?: number;
    morphFactor?: number;
    gridDensity?: number;
    dimension?: number;
}

export interface GeometryArgs {
    geometry_index?: number;
    base_geometry?: number;
    core_type?: number;
}

export class MCPServer {
    constructor(engine?: any);
    setEngine(engine: any): void;
    buildResponse(operation: string, data: Record<string, any>, options?: { success?: boolean; startTime?: number }): ToolResponse;
    validateToolResponse(response: ToolResponse): ToolResponse;
    handleToolCall(toolName: string, args?: Record<string, any>): Promise<ToolResponse>;
    createVisualization(args: { system?: string; geometry_index?: number; projection?: string }): Promise<ToolResponse>;
    setRotation(args: RotationArgs): ToolResponse;
    setVisualParameters(args: VisualParameterArgs): ToolResponse;
    switchSystem(args: { system: string }): Promise<ToolResponse>;
    changeGeometry(args: GeometryArgs): ToolResponse;
    getState(): ToolResponse;
    randomizeParameters(args?: { preserve_system?: boolean; preserve_geometry?: boolean }): ToolResponse;
    resetParameters(): ToolResponse;
    saveToGallery(args: { name?: string }): ToolResponse;
    loadFromGallery(args: { id?: number; name?: string }): ToolResponse;
    searchGeometries(args: { core_type?: string; query?: string }): ToolResponse;
    getParameterSchema(): ToolResponse;
    getSDKContext(): ToolResponse;
    listTools(includeSchemas?: boolean): ToolDefinition[];
    setReactivityConfig(args: Record<string, any>): ToolResponse;
    getReactivityConfig(): ToolResponse;
    configureAudioBand(args: Record<string, any>): ToolResponse;
    exportPackage(args: Record<string, any>): ToolResponse;
    applyBehaviorPreset(args: { preset: string }): ToolResponse;
    listBehaviorPresets(): ToolResponse;
    describeVisualState(): ToolResponse;
    batchSetParameters(args: { parameters: Record<string, any>[] }): Promise<ToolResponse>;
}

export const mcpServer: MCPServer;
export const toolDefinitions: ToolDefinition[];

export function getToolList(): ToolDefinition[];
export function getToolNames(): string[];
export function getTool(name: string): ToolDefinition | undefined;
export function validateToolInput(toolName: string, input: Record<string, any>): { valid: boolean; errors?: string[] };
