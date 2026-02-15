/**
 * @vib3code/sdk — Adaptive SDK TypeScript Definitions
 * VIB3+ 4D Visualization Engine v2.0.0
 *
 * Barrel re-export for all typed modules.
 *
 * Typed modules:
 *   - core (VIB3Engine, CanvasManager, ParameterManager, ParameterMapper, VitalitySystem, RendererContracts, UnifiedResourceManager)
 *   - math (constants, projections, rotations, Vec4)
 *   - geometry (GeometryLibrary, generators, BufferBuilder)
 *   - systems (QuantumEngine, FacetedSystem, RealHolographicSystem)
 *   - scene (ObjectPool, TypedArrayPool, Vec4Pool, PoolManager)
 *   - viewer (ViewerPortal, ViewerInputHandler, GalleryUI, CardBending, AudioReactivity, TradingCardExporter)
 *   - variations (VariationManager)
 *   - reactivity (ReactivityManager, ReactivityConfig, SpatialInputSystem)
 *   - render (WebGL/WebGPU backends, ShaderProgram, RenderState, CommandBuffer)
 *   - creative (ColorPresets, TransitionAnimator, PostProcessing, Timeline, AestheticMapper, ChoreographyPlayer)
 *   - integrations (React, Vue, Svelte, Figma, Three.js, TouchDesigner, OBS)
 *   - advanced (WebXR, WebGPU Compute, MIDI, AI Presets, OffscreenWorker)
 *   - export (ExportManager, ShaderExporter, VIB3PackageExporter, TradingCardGenerator)
 *   - agent (MCPServer, AgentCLI, TelemetryService)
 */

// Core engine
export {
    VIB3Engine,
    VIB3EngineOptions,
    VIB3EngineState,
    SystemName,
    BackendType,
    GeometryNames
} from './core/VIB3Engine';

// Core - Error Reporter
export {
    ErrorReporter,
    ErrorReporterOptions,
    ErrorReport
} from './core/ErrorReporter';

// Reactivity system
export {
    ReactivityManager,
    ReactivityConfig,
    ReactivityConfigData,
    ReactivityEvent,
    ValidationResult,
    AudioConfig,
    AudioBandConfig,
    AudioTarget,
    AudioBand,
    TiltConfig,
    TiltAxisMapping,
    InteractionConfig,
    MouseInteractionConfig,
    ClickInteractionConfig,
    ScrollInteractionConfig,
    TouchInteractionConfig,
    MouseMode,
    ClickMode,
    ScrollMode,
    BlendMode,
    TargetableParameter,
    ParameterUpdateFn,
    InputState,
    AudioInputState,
    TiltInputState,
    MouseInputState,
    ClickInputState,
    ScrollInputState,
    TouchInputState,
    TARGETABLE_PARAMETERS,
    AUDIO_BANDS,
    BLEND_MODES,
    INTERACTION_MODES,
    DEFAULT_REACTIVITY_CONFIG
} from './reactivity/index';

// Spatial Input System
export {
    SpatialInputSystem,
    createSpatialInputSystem,
    SpatialInputOptions,
    SpatialState,
    SpatialAxis,
    SourceType,
    SourceInfo,
    MappingEntry,
    ProfileDef,
    BuiltinProfile,
    SpatialEvent,
    SOURCE_TYPES,
    SPATIAL_AXES
} from './reactivity/SpatialInputSystem';

// Render system
export {
    RenderContext,
    RenderContextOptions,
    AsyncRenderContextOptions,
    createRenderContext,
    createRenderContextAsync,
    RenderPresets,
    Shader4D,
    Shader4DOptions
} from './render/index';

// Layer relationship system
export {
    LayerRelationshipGraph,
    RelationshipFn,
    RelationshipPreset,
    RelationshipConfig,
    LayerRelationshipProfile,
    LayerRelationshipExport,
    LAYER_ORDER as RENDER_LAYER_ORDER,
    PRESET_REGISTRY,
    PROFILES
} from './render/LayerRelationshipGraph';

// Layer preset manager
export {
    LayerPresetManager,
    LayerPreset,
    PresetMetadata,
    PresetLibrary,
    PresetManagerOptions
} from './render/LayerPresetManager';

// Layer reactivity bridge
export {
    LayerReactivityBridge,
    ModulationMapping,
    InputState as LayerInputState,
    ReactivityBridgeConfig,
    MODULATION_PROFILES
} from './render/LayerReactivityBridge';

// Creative tooling
export {
    ColorPresetsSystem,
    ColorPresetConfig,
    PresetInfo,
    PresetsByCategory,
    BuiltinPresetName,
    TransitionAnimator,
    EasingName,
    SequenceStep,
    PostProcessingPipeline,
    BuiltinEffectName,
    PresetChainName,
    EffectParamDef,
    EffectDetail,
    PresetChainInfo,
    PipelineState,
    ParameterTimeline,
    LoopMode,
    Keyframe,
    TimelineState
} from './creative/index';

// Platform integrations
export {
    Vib3ReactWrapper,
    Vib3CanvasProps,
    UseVib3Return,
    GeneratedPackage,
    Vib3VueWrapper,
    Vib3VueProps,
    UseVib3ComposableReturn,
    Vib3SvelteWrapper,
    Vib3SvelteProps,
    Vib3Store,
    Vib3StoreValue,
    Vib3FigmaPlugin,
    FigmaManifest,
    FigmaManifestOptions,
    FigmaCodeOptions,
    Vib3ThreeJsPackage,
    ShaderMaterialConfig,
    ShaderMaterialOptions,
    UniformValue,
    Vib3TouchDesignerExport,
    GLSLTOPOptions,
    TDUniformMapping,
    Vib3OBSMode,
    CaptureMode,
    OBSModeOptions,
    OBSBrowserSourceConfig,
    OBSRecommendedSettings
} from './integrations/index';

// Advanced features
export {
    WebXRRenderer,
    XRMode,
    XRSupportResult,
    SixDOFPose,
    TrackingMapping,
    XRFrameCallback,
    WebXREvent,
    WebGPUCompute,
    ParticleParams,
    MIDIController,
    CCMapping,
    CCMappingOptions,
    NoteMapping,
    MIDIInputInfo,
    MIDIMappingState,
    LearnCallback,
    AIPresetGenerator,
    VIB3Preset,
    ParamRange,
    ThemeName,
    OffscreenCanvasManager,
    WorkerMessage,
    WorkerMessageType,
    WorkerInitMessage,
    WorkerParamsMessage,
    WorkerSwitchMessage,
    WorkerResizeMessage
} from './advanced/index';

// Export system
export {
    ExportManager,
    ShaderExporter,
    VIB3PackageExporter,
    TradingCardGenerator,
    TradingCardManager,
    CardGeneratorBase,
    FacetedCardGenerator,
    QuantumCardGenerator,
    HolographicCardGenerator,
    TradingCardSystemFaceted,
    TradingCardSystemHolographic,
    TradingCardSystemQuantum,
    VIB3_PACKAGE_VERSION,
    exportSVG,
    downloadSVG,
    exportCSS,
    downloadCSS,
    toStyleObject,
    exportLottie,
    downloadLottie,
    createVIB3Package
} from './export/index';

// Core - expanded types (CanvasManager, Parameters, RendererContracts, etc.)
export {
    CanvasManager,
    CanvasLayer,
    ParameterManager,
    ParameterDef,
    VIB3Parameters,
    ParameterConfiguration,
    ParameterMapper,
    MappableSystem,
    VitalitySystem,
    RendererContract,
    RendererContractAdapter,
    ResourceManagerContract,
    FrameState,
    UnifiedResourceManager
} from './core/index';

// Math - constants, projections, rotations, Vec4
export {
    PI, TAU, HALF_PI, QUARTER_PI,
    DEG_TO_RAD, RAD_TO_DEG,
    EPSILON,
    PHI, PHI_INV,
    PLANE_NAMES as ROTATION_PLANE_NAMES,
    encodeGeometry,
    decodeGeometry,
    toRadians,
    toDegrees,
    clamp,
    lerp,
    smoothstep,
    smootherstep,
    perspectiveProject4D,
    stereographicProject4D,
    ProjectionResult,
    createRotationMatrix4D,
    identityMatrix4x4,
    multiplyMatrix4x4,
    transposeMatrix4x4,
    applyMatrix4x4,
    vectorLength4D,
    normalizeVector4D,
    normalizeRotationAngles,
    composeRotationMatrixFromAngles,
    RotationPlane,
    Matrix4x4,
    Vector4D,
    Vec4
} from './math/index';

// Geometry - library, generators, buffers
export {
    GeometryLibrary,
    Geometry4D,
    VariationParameters,
    GeometryBuffers,
    buildVertexBuffer,
    buildEdgeIndexBuffer,
    buildFaceIndexBuffer,
    buildGeometryBuffers,
    generateTesseract,
    generateSphere,
    generateTorus
} from './geometry/index';

// Visualization systems
export {
    QuantumEngine,
    QuantumEngineOptions,
    FacetedSystem,
    FacetedSystemOptions,
    RealHolographicSystem,
    HolographicSystemOptions,
    CanvasSet,
    AudioData,
    RenderMode
} from './systems/index';

// Scene - memory pools
export {
    ObjectPool,
    TypedArrayPool,
    Vec4Pool,
    Mat4x4Pool,
    PoolManager,
    pools,
    PoolStats,
    ObjectPoolOptions
} from './scene/index';

// Viewer - portal, input, gallery, cards
export {
    ViewerPortal,
    ViewerInputHandler,
    GalleryUI,
    CardBending,
    AudioReactivity as ViewerAudioReactivity,
    TradingCardExporter,
    PortalMode,
    RotationState,
    InputSource,
    InputPreset,
    GalleryViewMode,
    BendPreset,
    FrameStyle,
    RarityLevel
} from './viewer/index';

// Variations
export {
    VariationManager,
    VariationSlot,
    VariationOptions
} from './variations/index';

// Agent system
export {
    MCPServer,
    mcpServer,
    toolDefinitions,
    AgentCLI,
    BatchExecutor,
    CommandType,
    ResponseStatus,
    TelemetryService,
    TelemetrySpan,
    EventType,
    telemetry,
    EventStreamServer,
    EventStreamClient,
    PrometheusExporter,
    JSONExporter,
    NDJSONExporter,
    ConsoleExporter
} from './agent/index';
