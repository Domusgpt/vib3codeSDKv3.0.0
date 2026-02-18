import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../main.dart';

/// Grouped parameter sliders for all VIB3+ adjustable parameters.
/// Sections: Visual | Color | Rotation with Randomize/Reset actions.
class ParameterSliders extends StatelessWidget {
  const ParameterSliders({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<Vib3State>(
      builder: (context, state, _) {
        final p = state.params;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Action buttons
            Row(
              children: [
                Expanded(
                  child: _ActionButton(
                    icon: Icons.shuffle,
                    label: 'Randomize',
                    onTap: state.randomize,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _ActionButton(
                    icon: Icons.restart_alt,
                    label: 'Reset',
                    onTap: state.reset,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // ── Visual Section ──
            _SectionHeader(title: 'Visual'),
            _ParamSlider(
              label: 'Density', value: p.gridDensity,
              min: 4, max: 100, divisions: 96,
              format: (v) => v.toStringAsFixed(0),
              onChanged: (v) => state.updateParam('gridDensity', v),
            ),
            _ParamSlider(
              label: 'Morph', value: p.morphFactor,
              min: 0, max: 2, divisions: 200,
              onChanged: (v) => state.updateParam('morphFactor', v),
            ),
            _ParamSlider(
              label: 'Chaos', value: p.chaos,
              min: 0, max: 1, divisions: 100,
              onChanged: (v) => state.updateParam('chaos', v),
            ),
            _ParamSlider(
              label: 'Speed', value: p.speed,
              min: 0.1, max: 3, divisions: 290,
              onChanged: (v) => state.updateParam('speed', v),
            ),
            _ParamSlider(
              label: 'Dimension', value: p.dimension,
              min: 3.0, max: 4.5, divisions: 150,
              onChanged: (v) => state.updateParam('dimension', v),
            ),
            const SizedBox(height: 12),

            // ── Color Section ──
            _SectionHeader(title: 'Color'),
            _ParamSlider(
              label: 'Hue', value: p.hue,
              min: 0, max: 360, divisions: 360,
              format: (v) => '${v.toStringAsFixed(0)}\u00B0',
              activeColor: HSLColor.fromAHSL(1, p.hue, 0.8, 0.5).toColor(),
              onChanged: (v) => state.updateParam('hue', v),
            ),
            _ParamSlider(
              label: 'Saturation', value: p.saturation,
              min: 0, max: 1, divisions: 100,
              onChanged: (v) => state.updateParam('saturation', v),
            ),
            _ParamSlider(
              label: 'Intensity', value: p.intensity,
              min: 0, max: 1, divisions: 100,
              onChanged: (v) => state.updateParam('intensity', v),
            ),
            const SizedBox(height: 12),

            // ── Rotation Section ──
            _SectionHeader(title: 'Rotation (radians)'),
            _ParamSlider(
              label: 'XY', value: p.rot4dXY,
              min: 0, max: 2 * pi, divisions: 628,
              format: (v) => v.toStringAsFixed(2),
              onChanged: (v) => state.updateParam('rot4dXY', v),
            ),
            _ParamSlider(
              label: 'XZ', value: p.rot4dXZ,
              min: 0, max: 2 * pi, divisions: 628,
              format: (v) => v.toStringAsFixed(2),
              onChanged: (v) => state.updateParam('rot4dXZ', v),
            ),
            _ParamSlider(
              label: 'YZ', value: p.rot4dYZ,
              min: 0, max: 2 * pi, divisions: 628,
              format: (v) => v.toStringAsFixed(2),
              onChanged: (v) => state.updateParam('rot4dYZ', v),
            ),
            _ParamSlider(
              label: 'XW', value: p.rot4dXW,
              min: 0, max: 2 * pi, divisions: 628,
              format: (v) => v.toStringAsFixed(2),
              onChanged: (v) => state.updateParam('rot4dXW', v),
            ),
            _ParamSlider(
              label: 'YW', value: p.rot4dYW,
              min: 0, max: 2 * pi, divisions: 628,
              format: (v) => v.toStringAsFixed(2),
              onChanged: (v) => state.updateParam('rot4dYW', v),
            ),
            _ParamSlider(
              label: 'ZW', value: p.rot4dZW,
              min: 0, max: 2 * pi, divisions: 628,
              format: (v) => v.toStringAsFixed(2),
              onChanged: (v) => state.updateParam('rot4dZW', v),
            ),
          ],
        );
      },
    );
  }
}

// ── Reusable Widgets ──

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Text(
        title.toUpperCase(),
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: Colors.white.withValues(alpha: 0.4),
          letterSpacing: 1.5,
        ),
      ),
    );
  }
}

class _ParamSlider extends StatelessWidget {
  final String label;
  final double value;
  final double min;
  final double max;
  final int? divisions;
  final String Function(double)? format;
  final Color? activeColor;
  final ValueChanged<double> onChanged;

  const _ParamSlider({
    required this.label,
    required this.value,
    required this.min,
    required this.max,
    this.divisions,
    this.format,
    this.activeColor,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final display = format != null ? format!(value) : value.toStringAsFixed(2);
    final clampedValue = value.clamp(min, max);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          SizedBox(
            width: 64,
            child: Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: Colors.white.withValues(alpha: 0.6),
              ),
            ),
          ),
          Expanded(
            child: SliderTheme(
              data: SliderThemeData(
                trackHeight: 3,
                thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
                overlayShape: const RoundSliderOverlayShape(overlayRadius: 14),
                activeTrackColor: activeColor ?? const Color(0xFF8B5CF6),
                inactiveTrackColor: Colors.white.withValues(alpha: 0.08),
                thumbColor: activeColor ?? const Color(0xFFA855F7),
              ),
              child: Slider(
                value: clampedValue,
                min: min,
                max: max,
                divisions: divisions,
                onChanged: onChanged,
              ),
            ),
          ),
          SizedBox(
            width: 48,
            child: Text(
              display,
              textAlign: TextAlign.right,
              style: TextStyle(
                fontSize: 11,
                color: Colors.white.withValues(alpha: 0.5),
                fontFeatures: const [FontFeature.tabularFigures()],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.06),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 16, color: Colors.white54),
            const SizedBox(width: 6),
            Text(
              label,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: Colors.white54,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
