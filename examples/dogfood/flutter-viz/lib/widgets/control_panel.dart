import 'package:flutter/material.dart';
import 'package:vib3_flutter_viz/models/vib3_params.dart';

class ControlPanel extends StatefulWidget {
  final ValueChanged<Vib3Params> onParamChange;
  final Vib3Params? initialParams;

  const ControlPanel({
    super.key,
    required this.onParamChange,
    this.initialParams,
  });

  @override
  State<ControlPanel> createState() => _ControlPanelState();
}

class _ControlPanelState extends State<ControlPanel> {
  late Vib3Params _params;

  @override
  void initState() {
    super.initState();
    _params = widget.initialParams ?? Vib3Params();
  }

  void _update() {
    setState(() {});
    widget.onParamChange(_params);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 24, 24, 48),
      decoration: const BoxDecoration(
        color: Color(0xFF161920),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'VISUALIZATION CONTROLS',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                  letterSpacing: 1.5,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close, color: Colors.white54),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // System Selector
          _SectionLabel('SYSTEM'),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: Vib3System.values.map((sys) {
                final isSelected = _params.system == sys;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(sys.label),
                    selected: isSelected,
                    onSelected: (bool selected) {
                      if (selected) {
                        _params.system = sys;
                        _update();
                      }
                    },
                    backgroundColor: Colors.white10,
                    selectedColor: const Color(0xFF6D28D9),
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : Colors.white70,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                      side: BorderSide.none,
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 24),

          // Geometry
          _SectionLabel('GEOMETRY: ${_params.geometry}'),
          Slider(
            value: _params.geometry.toDouble(),
            min: 0,
            max: 23,
            divisions: 23,
            activeColor: const Color(0xFF6D28D9),
            onChanged: (v) {
              _params.geometry = v.toInt();
              _update();
            },
          ),

          // Hue & Saturation
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _SectionLabel('HUE'),
                    Slider(
                      value: _params.hue,
                      min: 0,
                      max: 1.0,
                      activeColor: HSVColor.fromAHSV(1.0, _params.hue * 360, 1.0, 1.0).toColor(),
                      onChanged: (v) {
                        _params.hue = v;
                        _update();
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _SectionLabel('SATURATION'),
                    Slider(
                      value: _params.saturation,
                      min: 0,
                      max: 1.0,
                      activeColor: const Color(0xFF6D28D9),
                      onChanged: (v) {
                        _params.saturation = v;
                        _update();
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),

          // Chaos & Speed
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _SectionLabel('CHAOS'),
                    Slider(
                      value: _params.chaos,
                      min: 0,
                      max: 1.0,
                      activeColor: const Color(0xFF6D28D9),
                      onChanged: (v) {
                        _params.chaos = v;
                        _update();
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _SectionLabel('SPEED'),
                    Slider(
                      value: _params.speed,
                      min: 0.1,
                      max: 3.0,
                      activeColor: const Color(0xFF6D28D9),
                      onChanged: (v) {
                        _params.speed = v;
                        _update();
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),

          // Density & Morph
           Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _SectionLabel('DENSITY'),
                    Slider(
                      value: _params.gridDensity,
                      min: 4,
                      max: 100,
                      activeColor: const Color(0xFF6D28D9),
                      onChanged: (v) {
                        _params.gridDensity = v;
                        _update();
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _SectionLabel('MORPH'),
                    Slider(
                      value: _params.morphFactor,
                      min: 0,
                      max: 2.0,
                      activeColor: const Color(0xFF6D28D9),
                      onChanged: (v) {
                        _params.morphFactor = v;
                        _update();
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () {
                // Reset Logic would go here
                _params = Vib3Params();
                _update();
              },
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.white70,
                side: const BorderSide(color: Colors.white24),
              ),
              child: const Text('RESET TO DEFAULTS'),
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String label;
  const _SectionLabel(this.label);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, left: 4),
      child: Text(
        label,
        style: const TextStyle(
          color: Colors.white54,
          fontSize: 10,
          fontWeight: FontWeight.w600,
          letterSpacing: 1.0,
        ),
      ),
    );
  }
}
