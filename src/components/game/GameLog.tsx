import { useTranslation } from "react-i18next";
import { useGameState } from "../../hooks/useGameState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import type { GameLogEntry } from "../../lib/types/game";

export function GameLog() {
    const { t } = useTranslation();
    const { game } = useGameState();

    if (!game) {
        return null;
    }

    // Get events from game log (most recent first)
    // Handle cases where log might not exist (for older saved games)
    const logEntries = Array.isArray(game.log) ? game.log : [];
    const events = [...logEntries].sort((a, b) => {
        const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
        const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
        return timeB - timeA;
    });

    return (
        <Card className="w-full h-full max-h-[400px] flex flex-col" role="region" aria-label={t("log.title")}>
            <CardHeader>
                <CardTitle id="game-log-title">{t("log.title")}</CardTitle>
                <CardDescription aria-label={t("log.round", { number: game.roundNumber })}>
                    {t("log.round", { number: game.roundNumber })}
                </CardDescription>
            </CardHeader>
            <CardContent
                className="flex-1 overflow-y-auto space-y-3"
                role="log"
                aria-label={t("log.title")}
                aria-live="polite"
                aria-atomic="false"
            >
                {events.length === 0 ? (
                    <div className="text-base text-gray-500 text-center py-4">{t("log.noEvents")}</div>
                ) : (
                    <ul className="space-y-3 m-0 p-0 list-none">
                        {events.map((event: GameLogEntry) => {
                            let typeLabel = "";
                            switch (event.type) {
                                case "score":
                                    typeLabel = t("log.score");
                                    break;
                                case "topple":
                                    typeLabel = t("log.topple");
                                    break;
                                case "round_start":
                                    typeLabel = t("log.roundStart");
                                    break;
                                case "round_end":
                                    typeLabel = t("log.roundEnd");
                                    break;
                                case "game_end":
                                    typeLabel = t("game.gameOver");
                                    break;
                                case "placement":
                                    typeLabel = t("log.placement");
                                    break;
                                default:
                                    typeLabel = t("log.dice");
                            }

                            let badgeClass = "";
                            if (event.type === "score") {
                                badgeClass = "bg-green-100 text-green-800 border-green-300 text-sm px-2 py-0.5";
                            } else if (event.type === "topple") {
                                badgeClass = "bg-red-100 text-red-800 border-red-300 text-sm px-2 py-0.5";
                            } else if (event.type === "round_start") {
                                badgeClass = "bg-blue-100 text-blue-800 border-blue-300 text-sm px-2 py-0.5";
                            } else if (event.type === "round_end") {
                                badgeClass = "bg-purple-100 text-purple-800 border-purple-300 text-sm px-2 py-0.5";
                            } else if (event.type === "game_end") {
                                badgeClass = "bg-orange-100 text-orange-800 border-orange-300 text-sm px-2 py-0.5";
                            } else if (event.type === "placement") {
                                badgeClass = "bg-yellow-100 text-yellow-800 border-yellow-300 text-sm px-2 py-0.5";
                            } else {
                                badgeClass = "bg-gray-100 text-gray-800 border-gray-300 text-sm px-2 py-0.5";
                            }

                            let playerNameLabel = "";
                            if (event.playerName) {
                                playerNameLabel = t("log.by", { playerName: event.playerName });
                            }

                            let pointsLabel = "";
                            if (event.points !== undefined) {
                                pointsLabel =
                                    event.points > 0
                                        ? t("log.gainedPoints", { points: event.points })
                                        : t("log.lostPoints", { points: Math.abs(event.points) });
                            }

                            const ariaLabel = `${typeLabel} event: ${event.message}${playerNameLabel}${pointsLabel}`;

                            return (
                                <li
                                    key={event.id}
                                    className="text-sm p-3 rounded border bg-white hover:bg-gray-50 transition-colors"
                                    aria-label={ariaLabel}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <Badge className={badgeClass}>{typeLabel}</Badge>
                                                {event.points !== undefined && (
                                                    <span
                                                        className={`font-semibold text-sm ${
                                                            event.points > 0 ? "text-green-600" : "text-red-600"
                                                        }`}
                                                    >
                                                        {event.points > 0 ? "+" : ""}
                                                        {event.points}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-gray-700 text-base">{event.message}</div>
                                            {event.playerName && (
                                                <div className="text-sm text-gray-500">{event.playerName}</div>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
