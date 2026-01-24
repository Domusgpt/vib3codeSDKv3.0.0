/**
 * StatcastIntegration - Interface for Statcast/pybaseball Data
 *
 * Provides patterns for integrating with pybaseball in Python or
 * fetching from Baseball Savant directly. Handles data normalization
 * and ghost data imputation.
 *
 * Python Integration Pattern:
 * ```python
 * from pybaseball import statcast
 * import json
 *
 * # Fetch season data
 * data = statcast(start_dt='2024-04-01', end_dt='2024-10-01')
 *
 * # Export for JS consumption
 * data.to_json('statcast_2024.json', orient='records')
 * ```
 *
 * @class StatcastIntegration
 */

export class StatcastIntegration {
    constructor(config = {}) {
        this.config = {
            // API endpoint (if direct fetch is supported)
            baseUrl: 'https://baseballsavant.mlb.com/statcast_search/csv',

            // Data fields to extract
            requiredFields: [
                'pitch_type', 'game_date', 'release_speed', 'release_pos_x',
                'release_pos_z', 'player_name', 'batter', 'pitcher', 'events',
                'description', 'spin_dir', 'spin_rate_deprecated', 'release_spin_rate',
                'release_extension', 'game_pk', 'pitcher_name', 'batter_name',
                'at_bat_number', 'pitch_number', 'home_team', 'away_team',
                'type', 'hit_location', 'bb_type', 'balls', 'strikes',
                'pfx_x', 'pfx_z', 'plate_x', 'plate_z', 'on_3b', 'on_2b', 'on_1b',
                'outs_when_up', 'inning', 'inning_topbot', 'hc_x', 'hc_y',
                'vx0', 'vy0', 'vz0', 'ax', 'ay', 'az', 'sz_top', 'sz_bot',
                'hit_distance_sc', 'launch_speed', 'launch_angle', 'effective_speed',
                'release_spin_dir', 'launch_speed_angle', 'umpire',
                'p_throws', 'stand'
            ],

            // Imputation strategy
            imputationStrategy: 'knn',
            knnNeighbors: 5,

            ...config
        };
    }

    /**
     * Parse JSON data exported from pybaseball
     * @param {string|Object} data - JSON string or parsed object
     * @returns {Array} Normalized pitch data
     */
    parseStatcastJSON(data) {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;

        // Normalize and validate
        const normalized = parsed.map(pitch => this.normalizePitch(pitch));

        // Handle ghost data (missing values)
        const imputed = this.imputeGhostData(normalized);

        return imputed;
    }

    /**
     * Normalize a single pitch record
     */
    normalizePitch(pitch) {
        return {
            // Identifiers
            game_pk: pitch.game_pk,
            at_bat_number: pitch.at_bat_number,
            pitch_number: pitch.pitch_number,
            game_date: pitch.game_date,

            // Players
            pitcher: pitch.pitcher,
            batter: pitch.batter,
            pitcher_name: pitch.player_name || pitch.pitcher_name,
            batter_name: pitch.batter_name,

            // Pitch classification
            pitch_type: pitch.pitch_type,
            type: pitch.type, // B, S, X
            description: pitch.description,
            events: pitch.events,

            // Kinematics (required for geometric analysis)
            release_speed: this.toFloat(pitch.release_speed),
            release_spin_rate: this.toFloat(pitch.release_spin_rate || pitch.spin_rate_deprecated),
            release_extension: this.toFloat(pitch.release_extension),

            // Initial conditions
            vx0: this.toFloat(pitch.vx0),
            vy0: this.toFloat(pitch.vy0),
            vz0: this.toFloat(pitch.vz0),
            ax: this.toFloat(pitch.ax),
            ay: this.toFloat(pitch.ay),
            az: this.toFloat(pitch.az),

            // Release point
            release_pos_x: this.toFloat(pitch.release_pos_x),
            release_pos_y: 50, // Standard Statcast y position
            release_pos_z: this.toFloat(pitch.release_pos_z),

            // Movement
            pfx_x: this.toFloat(pitch.pfx_x), // Horizontal movement (inches)
            pfx_z: this.toFloat(pitch.pfx_z), // Vertical movement (inches)

            // Plate location
            plate_x: this.toFloat(pitch.plate_x),
            plate_z: this.toFloat(pitch.plate_z),
            sz_top: this.toFloat(pitch.sz_top),
            sz_bot: this.toFloat(pitch.sz_bot),

            // Batted ball (if applicable)
            hc_x: this.toFloat(pitch.hc_x),
            hc_y: this.toFloat(pitch.hc_y),
            hit_distance_sc: this.toFloat(pitch.hit_distance_sc),
            launch_speed: this.toFloat(pitch.launch_speed),
            launch_angle: this.toFloat(pitch.launch_angle),

            // Context
            balls: pitch.balls,
            strikes: pitch.strikes,
            outs_when_up: pitch.outs_when_up,
            inning: pitch.inning,
            inning_topbot: pitch.inning_topbot,
            on_1b: pitch.on_1b,
            on_2b: pitch.on_2b,
            on_3b: pitch.on_3b,

            // Teams
            home_team: pitch.home_team,
            away_team: pitch.away_team,

            // Umpire (critical for zone analysis)
            umpire: pitch.umpire,

            // Handedness
            p_throws: pitch.p_throws, // R or L
            stand: pitch.stand,        // R or L

            // Spin
            spin_axis: this.toFloat(pitch.release_spin_dir || pitch.spin_dir)
        };
    }

    /**
     * Impute missing (ghost) data using KNN
     */
    imputeGhostData(pitches) {
        // Group by pitcher and pitch type for local imputation
        const groups = this.groupByPitcherAndType(pitches);

        const imputed = pitches.map(pitch => {
            const hasGhost = this.hasGhostData(pitch);

            if (!hasGhost) return pitch;

            // Find group for this pitch
            const key = `${pitch.pitcher}_${pitch.pitch_type}`;
            const group = groups.get(key) || [];

            // Find k nearest neighbors with complete data
            const neighbors = this.findNearestNeighbors(
                pitch,
                group.filter(p => !this.hasGhostData(p)),
                this.config.knnNeighbors
            );

            // Impute missing values
            return this.imputeFromNeighbors(pitch, neighbors);
        });

        return imputed;
    }

    /**
     * Check if pitch has ghost (missing) data in critical fields
     */
    hasGhostData(pitch) {
        const criticalFields = [
            'vx0', 'vy0', 'vz0', 'ax', 'ay', 'az',
            'release_spin_rate', 'release_pos_x', 'release_pos_z'
        ];

        return criticalFields.some(field =>
            pitch[field] === null ||
            pitch[field] === undefined ||
            isNaN(pitch[field])
        );
    }

    /**
     * Group pitches by pitcher and pitch type
     */
    groupByPitcherAndType(pitches) {
        const groups = new Map();

        for (const pitch of pitches) {
            const key = `${pitch.pitcher}_${pitch.pitch_type}`;
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key).push(pitch);
        }

        return groups;
    }

    /**
     * Find k nearest neighbors using velocity and movement
     */
    findNearestNeighbors(target, candidates, k) {
        if (candidates.length === 0) return [];

        const distances = candidates.map(candidate => {
            let dist = 0;

            // Use available fields for distance
            if (target.release_speed !== null && candidate.release_speed !== null) {
                dist += ((target.release_speed || 0) - candidate.release_speed) ** 2;
            }
            if (target.pfx_x !== null && candidate.pfx_x !== null) {
                dist += ((target.pfx_x || 0) - candidate.pfx_x) ** 2;
            }
            if (target.pfx_z !== null && candidate.pfx_z !== null) {
                dist += ((target.pfx_z || 0) - candidate.pfx_z) ** 2;
            }

            return { candidate, distance: Math.sqrt(dist) };
        });

        // Sort by distance and take k nearest
        distances.sort((a, b) => a.distance - b.distance);
        return distances.slice(0, k).map(d => d.candidate);
    }

    /**
     * Impute missing values from neighbors
     */
    imputeFromNeighbors(target, neighbors) {
        if (neighbors.length === 0) return target;

        const imputed = { ...target };

        const fieldsToImpute = [
            'vx0', 'vy0', 'vz0', 'ax', 'ay', 'az',
            'release_spin_rate', 'release_pos_x', 'release_pos_z',
            'release_extension'
        ];

        for (const field of fieldsToImpute) {
            if (imputed[field] === null || imputed[field] === undefined || isNaN(imputed[field])) {
                // Average from neighbors
                const values = neighbors
                    .map(n => n[field])
                    .filter(v => v !== null && v !== undefined && !isNaN(v));

                if (values.length > 0) {
                    imputed[field] = values.reduce((s, v) => s + v, 0) / values.length;
                }
            }
        }

        return imputed;
    }

    /**
     * Generate Python script for data fetching
     */
    generatePythonScript(options = {}) {
        const {
            startDate = '2024-04-01',
            endDate = '2024-10-01',
            outputPath = 'statcast_data.json'
        } = options;

        return `
#!/usr/bin/env python3
"""
Statcast Data Fetcher for Geometric Alpha Engine
Generated by StatcastIntegration.js
"""

from pybaseball import statcast, cache
import pandas as pd
import json
from datetime import datetime

# Enable caching
cache.enable()

def fetch_season_data(start_date, end_date, output_path):
    """Fetch Statcast data for a date range."""
    print(f"Fetching Statcast data from {start_date} to {end_date}...")

    # Fetch data
    data = statcast(start_dt=start_date, end_dt=end_date)

    print(f"Fetched {len(data)} pitches")

    # Clean and convert types
    data = data.where(pd.notnull(data), None)

    # Convert to JSON
    records = data.to_dict(orient='records')

    # Save
    with open(output_path, 'w') as f:
        json.dump(records, f)

    print(f"Saved to {output_path}")

    return len(data)

def fetch_player_data(player_id, start_date, end_date):
    """Fetch data for a specific player."""
    from pybaseball import statcast_pitcher, statcast_batter

    # Try as pitcher first
    try:
        data = statcast_pitcher(start_dt=start_date, end_dt=end_date, player_id=player_id)
        if len(data) > 0:
            return data, 'pitcher'
    except:
        pass

    # Try as batter
    try:
        data = statcast_batter(start_dt=start_date, end_dt=end_date, player_id=player_id)
        if len(data) > 0:
            return data, 'batter'
    except:
        pass

    return None, None

if __name__ == '__main__':
    # Configuration
    START_DATE = '${startDate}'
    END_DATE = '${endDate}'
    OUTPUT_PATH = '${outputPath}'

    # Fetch data
    pitch_count = fetch_season_data(START_DATE, END_DATE, OUTPUT_PATH)

    print(f"\\nCompleted! Total pitches: {pitch_count}")
`;
    }

    // === Utility Methods ===

    toFloat(value) {
        if (value === null || value === undefined || value === '') {
            return null;
        }
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
    }
}
