import { useTranslation } from "react-i18next";
import { useGameState } from "../../hooks/useGameState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import type { PlayerColor } from "../../lib/types/player";

function getColorBackground(color: PlayerColor): string {
    switch (color) {
        case "pink":
            return "#FF69B4"; // Hot pink - matches piece color
        case "yellow":
            return "#FFD700"; // Gold - matches piece color
        case "orange":
            return "#FF8C00"; // Dark orange - matches piece color
        case "purple":
            return "#9370DB"; // Medium purple - matches piece color
        default:
            return "#9370DB";
    }
}

export function ScoreDisplay() {
    const { t } = useTranslation();
    const { game, currentPlayer } = useGameState();

    if (!game) {
        return null;
    }

    const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);

    return (
        <Card className="w-full mx-auto" role="region" aria-label={t("scoring.title")}>
            <CardHeader>
                <CardTitle>{t("scoring.scores")}</CardTitle>
                <CardDescription>{t("scoring.victoryPoints", { points: game.victoryPoints })}</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3" aria-label={t("scoring.title")}>
                    {sortedPlayers.map((player) => {
                        const isCurrentPlayer = currentPlayer?.id === player.id;
                        const colorClass = isCurrentPlayer ? "ring-2 ring-blue-400" : "";
                        // Only show winner badge when game is actually over
                        const isWinner = game.status === "gameEnd" && player.score >= game.victoryPoints;
                        const bgClass = isCurrentPlayer ? "bg-blue-50" : "bg-white";

                        return (
                            <li
                                key={player.id}
                                className={`flex items-center justify-between p-4 rounded-lg border ${colorClass} ${bgClass}`}
                                aria-label={`${player.name}: ${t("scoring.points", { points: player.score })}, ${t("scoring.piecesRemaining", { pieces: player.piecesRemaining })}${isCurrentPlayer ? t("scoring.currentPlayer") : ""}${isWinner ? t("scoring.winner") : ""}`}
                            >
                                <div className="flex items-center gap-2">
                                    {player.color2 ? (
                                        <div className="flex items-center gap-1">
                                            <div
                                                className="w-4 h-4 rounded-full border-2"
                                                style={{
                                                    backgroundColor: getColorBackground(player.color),
                                                }}
                                                title={t(`setup.${player.color}`)}
                                                aria-label={t(`setup.${player.color}`)}
                                            />
                                            <div
                                                className="w-4 h-4 rounded-full border-2"
                                                style={{
                                                    backgroundColor: getColorBackground(player.color2),
                                                }}
                                                title={t(`setup.${player.color2}`)}
                                                aria-label={t(`setup.${player.color2}`)}
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            className="w-4 h-4 rounded-full border-2"
                                            style={{
                                                backgroundColor: getColorBackground(player.color),
                                            }}
                                        />
                                    )}
                                    <div>
                                        <div className="font-semibold text-base">
                                            {player.name}
                                            {isCurrentPlayer && (
                                                <Badge className="ml-1 border text-sm px-2 py-0.5">
                                                    {t("scoring.current")}
                                                </Badge>
                                            )}
                                            {isWinner && (
                                                <Badge className="ml-1 bg-green-500 text-white text-sm px-2 py-0.5">
                                                    {t("scoring.winnerBadge")}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {player.color2 && player.piecesRemainingByColor ? (
                                                <div className="space-y-1">
                                                    <div>
                                                        {t("scoring.piecesRemaining", {
                                                            pieces: player.piecesRemainingByColor[player.color] || 0,
                                                        })}{" "}
                                                        ({t(`setup.${player.color}`)})
                                                    </div>
                                                    <div>
                                                        {t("scoring.piecesRemaining", {
                                                            pieces: player.piecesRemainingByColor[player.color2] || 0,
                                                        })}{" "}
                                                        ({t(`setup.${player.color2}`)})
                                                    </div>
                                                </div>
                                            ) : (
                                                t("scoring.piecesRemaining", {
                                                    pieces: player.piecesRemaining,
                                                })
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {player.color2 && player.scoreByColor ? (
                                        <div className="space-y-1">
                                            <div className="text-xl font-bold">{player.score}</div>
                                            <div className="text-sm text-gray-500">{t("scoring.pointsLabel")}</div>
                                            <div className="text-xs text-gray-400 space-y-0.5 mt-1">
                                                <div>
                                                    {t(`setup.${player.color}`)}:{" "}
                                                    {player.scoreByColor[player.color] || 0}
                                                </div>
                                                <div>
                                                    {t(`setup.${player.color2}`)}:{" "}
                                                    {player.scoreByColor[player.color2] || 0}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="text-2xl font-bold">{player.score}</div>
                                            <div className="text-sm text-gray-500">{t("scoring.pointsLabel")}</div>
                                        </>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </CardContent>
        </Card>
    );
}
