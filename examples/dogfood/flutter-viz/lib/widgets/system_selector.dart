import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../main.dart';
import '../models/vib3_params.dart';

/// Horizontal row of 3 system buttons: Faceted / Quantum / Holographic.
/// Active system highlighted with system-specific color.
class SystemSelector extends StatelessWidget {
  const SystemSelector({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<Vib3State>(
      builder: (context, state, _) {
        final active = state.params.system;
        return Row(
          children: Vib3System.values.map((sys) {
            final isActive = sys == active;
            final color = _systemColor(sys);
            return Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: GestureDetector(
                  onTap: () => state.setSystem(sys),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      color: isActive ? color.withValues(alpha: 0.25) : Colors.white.withValues(alpha: 0.05),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: isActive ? color.withValues(alpha: 0.7) : Colors.white.withValues(alpha: 0.1),
                        width: isActive ? 2 : 1,
                      ),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          _systemIcon(sys),
                          size: 20,
                          color: isActive ? color : Colors.white38,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          sys.label,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: isActive ? FontWeight.w700 : FontWeight.w400,
                            color: isActive ? color : Colors.white54,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        );
      },
    );
  }

  Color _systemColor(Vib3System sys) {
    switch (sys) {
      case Vib3System.faceted:
        return const Color(0xFF3B82F6);
      case Vib3System.quantum:
        return const Color(0xFFA855F7);
      case Vib3System.holographic:
        return const Color(0xFF10B981);
    }
  }

  IconData _systemIcon(Vib3System sys) {
    switch (sys) {
      case Vib3System.faceted:
        return Icons.diamond_outlined;
      case Vib3System.quantum:
        return Icons.blur_on;
      case Vib3System.holographic:
        return Icons.layers_outlined;
    }
  }
}
