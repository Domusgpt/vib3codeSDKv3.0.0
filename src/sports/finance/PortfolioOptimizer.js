/**
 * PortfolioOptimizer - Simultaneous Kelly Criterion Solver
 *
 * When betting on multiple simultaneous events, the single-bet Kelly formula
 * leads to over-exposure. This optimizer solves for the optimal portfolio
 * of bets that maximizes expected log growth while respecting constraints.
 *
 * The optimization problem:
 *   maximize: E[log(bankroll)] = sum_s P(s) * log(1 + sum_i f_i * r_i(s))
 *   subject to: sum(f_i) <= maxExposure
 *               0 <= f_i <= maxSingleBet for all i
 *
 * We use a coordinate descent algorithm for efficiency.
 *
 * @class PortfolioOptimizer
 */

import { KellyCriterion } from './KellyCriterion.js';

export class PortfolioOptimizer {
    constructor(config = {}) {
        this.config = {
            // Maximum total exposure
            maxExposure: config.maxExposure || 0.25,

            // Maximum single bet
            maxSingleBet: config.maxSingleBet || 0.05,

            // Kelly fraction
            kellyFraction: config.kellyFraction || 0.25,

            // Optimization parameters
            maxIterations: config.maxIterations || 100,
            convergenceThreshold: config.convergenceThreshold || 1e-6,
            stepSize: config.stepSize || 0.001,

            // Correlation handling
            correlationPenalty: config.correlationPenalty || 0.1,

            ...config
        };

        this.kelly = new KellyCriterion({
            fraction: this.config.kellyFraction,
            maxSingleBet: this.config.maxSingleBet
        });
    }

    /**
     * Solve for optimal bet allocations
     * @param {Array} opportunities - Array of bet opportunities
     * @param {number} bankroll - Current bankroll
     * @returns {Object} Optimal allocations and metrics
     */
    solve(opportunities, bankroll) {
        if (opportunities.length === 0) {
            return {
                allocations: [],
                totalExposure: 0,
                expectedGrowth: 0
            };
        }

        // Initialize with single-bet Kelly stakes
        const n = opportunities.length;
        const fractions = new Array(n).fill(0);

        // Calculate individual Kelly stakes
        for (let i = 0; i < n; i++) {
            const opp = opportunities[i];
            fractions[i] = this.kelly.calculateSingleKelly(opp.modelProb, opp.odds);
        }

        // Scale down if total exceeds max exposure
        const totalKelly = fractions.reduce((s, f) => s + f, 0);
        if (totalKelly > this.config.maxExposure) {
            const scale = this.config.maxExposure / totalKelly;
            for (let i = 0; i < n; i++) {
                fractions[i] *= scale;
            }
        }

        // Refine with coordinate descent
        const refined = this.coordinateDescent(opportunities, fractions);

        // Convert to dollar amounts
        const allocations = opportunities.map((opp, i) => ({
            ...opp,
            fraction: refined[i],
            amount: refined[i] * bankroll,
            expectedValue: this.kelly.calculateEdge(opp.modelProb, opp.odds) * refined[i] * bankroll
        }));

        // Calculate portfolio metrics
        const totalExposure = refined.reduce((s, f) => s + f, 0);
        const expectedGrowth = this.calculateExpectedGrowth(opportunities, refined);

        return {
            allocations,
            totalExposure,
            expectedGrowth,
            totalEV: allocations.reduce((s, a) => s + a.expectedValue, 0),
            numBets: allocations.filter(a => a.amount > 0).length
        };
    }

    /**
     * Coordinate descent optimization
     */
    coordinateDescent(opportunities, initialFractions) {
        const n = opportunities.length;
        let fractions = [...initialFractions];
        let prevGrowth = this.calculateExpectedGrowth(opportunities, fractions);

        for (let iter = 0; iter < this.config.maxIterations; iter++) {
            // Optimize each coordinate
            for (let i = 0; i < n; i++) {
                fractions[i] = this.optimizeCoordinate(opportunities, fractions, i);
            }

            // Check convergence
            const growth = this.calculateExpectedGrowth(opportunities, fractions);
            if (Math.abs(growth - prevGrowth) < this.config.convergenceThreshold) {
                break;
            }
            prevGrowth = growth;
        }

        return fractions;
    }

    /**
     * Optimize a single coordinate (bet) while holding others fixed
     */
    optimizeCoordinate(opportunities, fractions, idx) {
        const opp = opportunities[idx];
        const others = fractions.filter((_, i) => i !== idx);
        const othersSum = others.reduce((s, f) => s + f, 0);

        // Maximum we can bet on this opportunity
        const maxFraction = Math.min(
            this.config.maxSingleBet,
            this.config.maxExposure - othersSum
        );

        if (maxFraction <= 0) return 0;

        // Grid search for optimal fraction
        let bestFraction = 0;
        let bestGrowth = -Infinity;

        for (let f = 0; f <= maxFraction; f += this.config.stepSize) {
            const testFractions = [...fractions];
            testFractions[idx] = f;

            const growth = this.calculateExpectedGrowth(opportunities, testFractions);
            if (growth > bestGrowth) {
                bestGrowth = growth;
                bestFraction = f;
            }
        }

        return bestFraction;
    }

    /**
     * Calculate expected log growth for a portfolio
     * Approximation for independent events
     */
    calculateExpectedGrowth(opportunities, fractions) {
        let growth = 0;

        for (let i = 0; i < opportunities.length; i++) {
            const opp = opportunities[i];
            const f = fractions[i];

            if (f <= 0) continue;

            const decimal = this.kelly.americanToDecimal(opp.odds);
            const p = opp.modelProb;
            const q = 1 - p;

            // E[log] for this bet
            growth += p * Math.log(1 + f * (decimal - 1));
            growth += q * Math.log(1 - f);
        }

        // Apply correlation penalty
        const correlationTerm = this.calculateCorrelationPenalty(opportunities, fractions);
        growth -= correlationTerm;

        return growth;
    }

    /**
     * Calculate penalty for correlated bets
     */
    calculateCorrelationPenalty(opportunities, fractions) {
        let penalty = 0;

        // Check for same-game bets (highly correlated)
        for (let i = 0; i < opportunities.length; i++) {
            for (let j = i + 1; j < opportunities.length; j++) {
                if (opportunities[i].gameId === opportunities[j].gameId) {
                    // Same game - apply penalty
                    penalty += this.config.correlationPenalty *
                        fractions[i] * fractions[j];
                }
            }
        }

        return penalty;
    }

    /**
     * Solve with explicit correlation matrix
     */
    solveWithCorrelation(opportunities, bankroll, correlationMatrix) {
        // This is a more sophisticated solver that handles correlation explicitly
        // For now, we use the penalty-based approach above

        return this.solve(opportunities, bankroll);
    }

    /**
     * Calculate portfolio variance
     */
    calculatePortfolioVariance(opportunities, fractions) {
        let variance = 0;

        // Individual variances
        for (let i = 0; i < opportunities.length; i++) {
            const opp = opportunities[i];
            const f = fractions[i];
            const decimal = this.kelly.americanToDecimal(opp.odds);
            const p = opp.modelProb;

            // Var = p * (b^2) + q * 1 - (p*b - q)^2
            const betVariance = p * (decimal - 1) ** 2 + (1 - p) -
                (p * (decimal - 1) - (1 - p)) ** 2;

            variance += f ** 2 * betVariance;
        }

        return variance;
    }

    /**
     * Calculate Sharpe-like ratio for the portfolio
     */
    calculateSharpe(opportunities, fractions) {
        const expectedReturn = opportunities.reduce((sum, opp, i) => {
            return sum + fractions[i] * this.kelly.calculateEdge(opp.modelProb, opp.odds);
        }, 0);

        const variance = this.calculatePortfolioVariance(opportunities, fractions);

        if (variance === 0) return 0;

        return expectedReturn / Math.sqrt(variance);
    }

    /**
     * Analyze portfolio composition
     */
    analyzePortfolio(allocations) {
        const analysis = {
            byBetType: {},
            byTeam: {},
            byGame: {},
            exposureProfile: {
                total: 0,
                largest: 0,
                average: 0
            }
        };

        for (const alloc of allocations) {
            if (alloc.amount <= 0) continue;

            // By bet type
            if (!analysis.byBetType[alloc.betType]) {
                analysis.byBetType[alloc.betType] = { count: 0, exposure: 0 };
            }
            analysis.byBetType[alloc.betType].count++;
            analysis.byBetType[alloc.betType].exposure += alloc.fraction;

            // By team
            if (alloc.team) {
                if (!analysis.byTeam[alloc.team]) {
                    analysis.byTeam[alloc.team] = { count: 0, exposure: 0 };
                }
                analysis.byTeam[alloc.team].count++;
                analysis.byTeam[alloc.team].exposure += alloc.fraction;
            }

            // By game
            if (!analysis.byGame[alloc.gameId]) {
                analysis.byGame[alloc.gameId] = { count: 0, exposure: 0 };
            }
            analysis.byGame[alloc.gameId].count++;
            analysis.byGame[alloc.gameId].exposure += alloc.fraction;

            // Exposure profile
            analysis.exposureProfile.total += alloc.fraction;
            analysis.exposureProfile.largest = Math.max(
                analysis.exposureProfile.largest,
                alloc.fraction
            );
        }

        const numBets = allocations.filter(a => a.amount > 0).length;
        analysis.exposureProfile.average = numBets > 0 ?
            analysis.exposureProfile.total / numBets : 0;

        return analysis;
    }
}
