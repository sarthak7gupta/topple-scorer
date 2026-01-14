import { useTranslation } from "react-i18next";
import { useGameState } from "../../hooks/useGameState";
import { ScoreDisplay } from "./ScoreDisplay";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { determineWinner } from "../../lib/game/round";
import { SettingsBar } from "../settings/SettingsBar";

export function GameEndScreen() {
    const { t } = useTranslation();
    const { game, resetGame } = useGameState();

    if (game?.status !== "gameEnd") {
        return null;
    }

    const winner = determineWinner(game);

    return (
        <section className="space-y-6" aria-label={t("gameEnd.startNewGame")} aria-live="polite">
            <div className="flex justify-end mb-2">
                <SettingsBar />
            </div>
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800" id="game-end-title">
                    {t("game.gameOver")}
                </h1>
                <p
                    className="text-sm text-gray-500"
                    aria-label={t("gameEnd.gameEndedAfter", {
                        round: game.roundNumber,
                    })}
                >
                    {t("game.round", { number: game.roundNumber })}
                </p>
            </div>
            {winner && (
                <Card
                    className="max-w-md mx-auto border-green-300 bg-green-50"
                    role="region"
                    aria-label={t("gameEnd.winner", { name: winner.name })}
                >
                    <CardHeader>
                        <CardTitle className="text-green-700" id="winner-name">
                            {t("gameEnd.winner", { name: winner.name })}
                        </CardTitle>
                        <CardDescription
                            aria-label={t("gameEnd.finalScore", {
                                score: winner.score,
                            })}
                        >
                            {t("gameEnd.finalScore", { score: winner.score })}
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}
            <ScoreDisplay />

            {/* Game Statistics */}
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>{t("gameEnd.gameStatistics")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-600">{t("gameEnd.roundsPlayed")}:</span>
                        <span className="font-semibold">{game.roundNumber}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">{t("gameEnd.totalPlacements")}:</span>
                        <span className="font-semibold">
                            {game.board.cells.reduce(
                                (total, row) =>
                                    total + row.reduce((rowTotal, cell) => rowTotal + cell.stack.length, 0),
                                0
                            )}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">{t("gameEnd.totalEvents")}:</span>
                        <span className="font-semibold">{game.log.length}</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="max-w-md mx-auto">
                <CardContent className="pt-6">
                    <Button onClick={resetGame} className="w-full text-lg py-6" aria-label={t("gameEnd.startNewGame")}>
                        {t("gameEnd.startNewGame")}
                    </Button>
                </CardContent>
            </Card>
        </section>
    );
}
