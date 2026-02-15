/**
 * Creative Module TypeScript Definitions
 * VIB3+ SDK - Color Presets, Transitions, Post-Processing, Timeline
 */

export {
    ColorPresetsSystem,
    ColorPresetConfig,
    PresetInfo,
    PresetsByCategory,
    BuiltinPresetName
} from './ColorPresetsSystem';

export {
    TransitionAnimator,
    EasingName,
    SequenceStep
} from './TransitionAnimator';

export {
    PostProcessingPipeline,
    BuiltinEffectName,
    PresetChainName,
    EffectParamDef,
    EffectDetail,
    PresetChainInfo,
    PipelineState
} from './PostProcessingPipeline';

export {
    ParameterTimeline,
    LoopMode,
    Keyframe,
    TimelineState
} from './ParameterTimeline';

export {
    AestheticMapper,
    AestheticMapping,
    AestheticResult,
    AestheticValues,
    ParameterRange,
    VocabularyEntry
} from './AestheticMapper';

export {
    ChoreographyPlayer,
    ChoreographySpec,
    ChoreographyScene,
    ChoreographyPlayerOptions,
    ChoreographyState
} from './ChoreographyPlayer';
