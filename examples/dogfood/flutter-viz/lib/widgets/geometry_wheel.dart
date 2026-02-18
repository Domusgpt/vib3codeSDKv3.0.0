import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../main.dart';
import '../models/vib3_params.dart';

/// Two-level geometry selector:
/// - Core warp row: Base / Hypersphere / Hypertetrahedron
/// - Base geometry grid: 2x4 grid of 8 base geometries
class GeometryWheel extends StatelessWidget {
  const GeometryWheel({super.key});

  static const _geoIcons = [
    Icons.change_history,       // Tetrahedron
    Icons.crop_square,          // Hypercube
    Icons.circle_outlined,      // Sphere
    Icons.donut_large,          // Torus
    Icons.all_inclusive,         // Klein Bottle
    Icons.account_tree,         // Fractal
    Icons.waves,                // Wave
    Icons.hexagon_outlined,     // Crystal
  ];

  @override
  Widget build(BuildContext context) {
    return Consumer<Vib3State>(
      builder: (context, state, _) {
        final geo = state.params.geometry;
        final activeBase = BaseGeometry.fromIndex(geo % 8);
        final activeWarp = CoreWarp.fromIndex(geo ~/ 8);

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with current geometry name + index
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Geometry',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Colors.white.withValues(alpha: 0.7),
                  ),
                ),
                Text(
                  '${activeWarp.index > 0 ? "${activeWarp.label} " : ""}${activeBase.label}  [$geo]',
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.white.withValues(alpha: 0.5),
                    fontFeatures: const [FontFeature.tabularFigures()],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Core warp row
            Row(
              children: CoreWarp.values.map((warp) {
                final isActive = warp == activeWarp;
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 3),
                    child: GestureDetector(
                      onTap: () => state.setGeometry(activeBase, warp),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 150),
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        decoration: BoxDecoration(
                          color: isActive
                              ? Colors.white.withValues(alpha: 0.12)
                              : Colors.white.withValues(alpha: 0.04),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: isActive
                                ? Colors.white.withValues(alpha: 0.3)
                                : Colors.white.withValues(alpha: 0.08),
                          ),
                        ),
                        child: Text(
                          warp.label,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                            color: isActive ? Colors.white : Colors.white38,
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 8),

            // Base geometry 2x4 grid
            GridView.count(
              crossAxisCount: 4,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 6,
              crossAxisSpacing: 6,
              childAspectRatio: 1.4,
              children: BaseGeometry.values.map((base) {
                final isActive = base == activeBase;
                return GestureDetector(
                  onTap: () => state.setGeometry(base, activeWarp),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 150),
                    decoration: BoxDecoration(
                      color: isActive
                          ? const Color(0xFFA855F7).withValues(alpha: 0.2)
                          : Colors.white.withValues(alpha: 0.04),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: isActive
                            ? const Color(0xFFA855F7).withValues(alpha: 0.5)
                            : Colors.white.withValues(alpha: 0.08),
                      ),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          _geoIcons[base.index],
                          size: 18,
                          color: isActive ? const Color(0xFFA855F7) : Colors.white30,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          base.label,
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                            color: isActive ? Colors.white : Colors.white38,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        );
      },
    );
  }
}
