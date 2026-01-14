import { useGameState } from "../../hooks/useGameState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useMemo } from "react";

interface DiceFrequency {
    playerId: string;
    playerName: string;
    frequencies: Record<number, number>;
    totalRolls: number;
}

export function AnalyticsDashboard() {
    const { game } = useGameState();

    const analytics = useMemo(() => {
        if (!game?.log) return null;

        // Calculate dice frequency per player
        const diceRolls = game.log.filter((entry) => entry.type === "dice_roll");
        const diceFrequency: Record<string, DiceFrequency> = {};

        diceRolls.forEach((entry) => {
            if (!entry.playerId || !entry.playerName) return;

            if (!diceFrequency[entry.playerId]) {
                diceFrequency[entry.playerId] = {
                    playerId: entry.playerId,
                    playerName: entry.playerName,
                    frequencies: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
                    totalRolls: 0,
                };
            }

            // Extract dice roll value from message (e.g., "Alice rolled a 4")
            const match = /rolled a (\d)/.exec(entry.message);
            if (match) {
                const rollValue = Number.parseInt(match[1], 10);
                if (rollValue >= 1 && rollValue <= 6) {
                    diceFrequency[entry.playerId].frequencies[rollValue]++;
                    diceFrequency[entry.playerId].totalRolls++;
                }
            }
        });

        // Calculate average scores
        const averageScores = game.players.map((player) => ({
            playerId: player.id,
            playerName: player.name,
            averageScore: game.roundNumber > 1 ? player.score / (game.roundNumber - 1) : player.score,
            totalScore: player.score,
        }));

        // Calculate placement statistics
        const placements = game.log.filter((entry) => entry.type === "placement");
        const placementsPerPlayer: Record<string, number> = {};
        placements.forEach((entry) => {
            if (entry.playerId) {
                placementsPerPlayer[entry.playerId] = (placementsPerPlayer[entry.playerId] || 0) + 1;
            }
        });

        return {
            diceFrequency: Object.values(diceFrequency),
            averageScores,
            placementsPerPlayer,
            totalRounds: game.roundNumber,
            totalPlacements: placements.length,
        };
    }, [game]);

    if (!game || !analytics) {
        return null;
    }

    return (
        <Card role="region" aria-label="Game analytics dashboard">
            <CardHeader>
                <CardTitle id="analytics-title">Game Analytics</CardTitle>
                <CardDescription id="analytics-description">Statistics and insights from your game</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Dice Frequency */}
                {analytics.diceFrequency.length > 0 && (
                    <section aria-label="Dice roll frequency statistics">
                        <h3 className="font-semibold mb-3 text-base" id="dice-frequency-heading">
                            Dice Roll Frequency
                        </h3>
                        <div className="space-y-4">
                            {analytics.diceFrequency.map((player) => (
                                <fieldset
                                    key={player.playerId}
                                    className="space-y-2"
                                    aria-label={`Dice roll frequency for ${player.playerName}`}
                                >
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium" aria-label={`Player: ${player.playerName}`}>
                                            {player.playerName}
                                        </span>
                                        <span
                                            className="text-gray-500"
                                            aria-label={`Total rolls: ${player.totalRolls}`}
                                        >
                                            Total: {player.totalRolls}
                                        </span>
                                    </div>
                                    <ul
                                        className="grid grid-cols-6 gap-1"
                                        aria-label={`Dice roll distribution for ${player.playerName}`}
                                    >
                                        {[1, 2, 3, 4, 5, 6].map((value) => {
                                            const count = player.frequencies[value] || 0;
                                            const percentage =
                                                player.totalRolls > 0 ? (count / player.totalRolls) * 100 : 0;
                                            return (
                                                <li
                                                    key={value}
                                                    className="text-center"
                                                    aria-label={`Rolled ${value}: ${count} times (${percentage.toFixed(1)}%)`}
                                                >
                                                    <div className="text-sm font-semibold" aria-hidden="true">
                                                        {value}
                                                    </div>
                                                    <div className="text-sm text-gray-500" aria-hidden="true">
                                                        {count}
                                                    </div>
                                                    <progress
                                                        className="w-full h-2 mt-1 rounded-full bg-gray-200 [appearance:none]"
                                                        value={percentage}
                                                        max={100}
                                                        aria-label={`${percentage.toFixed(1)}% of rolls were ${value}`}
                                                        style={{
                                                            accentColor: "#3b82f6", // Tailwind blue-500
                                                        }}
                                                    />
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </fieldset>
                            ))}
                        </div>
                    </section>
                )}

                {/* Average Scores */}
                <section aria-label="Average scores per round">
                    <h3 className="font-semibold mb-3 text-base" id="avg-scores-heading">
                        Average Score per Round
                    </h3>
                    <ul className="space-y-2" aria-labelledby="avg-scores-heading">
                        {analytics.averageScores.map((player) => (
                            <li
                                key={player.playerId}
                                className="flex justify-between items-center"
                                aria-label={`${player.playerName}: average ${player.averageScore.toFixed(1)} points per round, total ${player.totalScore} points`}
                            >
                                <span className="text-sm">{player.playerName}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500" aria-hidden="true">
                                        {player.averageScore.toFixed(1)} avg
                                    </span>
                                    <span className="text-sm font-semibold" aria-hidden="true">
                                        ({player.totalScore})
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Game Stats */}
                <section aria-labelledby="game-stats-heading">
                    <h3 className="font-semibold mb-3 text-base" id="game-stats-heading">
                        Game Statistics
                    </h3>
                    <ul className="space-y-2 text-sm" aria-labelledby="game-stats-heading">
                        <li className="flex justify-between" aria-label={`Current round: ${analytics.totalRounds}`}>
                            <span>Current Round:</span>
                            <span className="font-semibold">{analytics.totalRounds}</span>
                        </li>
                        <li
                            className="flex justify-between"
                            aria-label={`Total placements: ${analytics.totalPlacements}`}
                        >
                            <span>Total Placements:</span>
                            <span className="font-semibold">{analytics.totalPlacements}</span>
                        </li>
                    </ul>
                </section>
            </CardContent>
        </Card>
    );
}
