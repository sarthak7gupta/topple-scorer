import { useTranslation } from "react-i18next";
import { useGameState } from "../../hooks/useGameState";
import { ScoreDisplay } from "./ScoreDisplay";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { SettingsBar } from "../settings/SettingsBar";

export function RoundEndScreen() {
    const { t } = useTranslation();
    const { game, startNewRound } = useGameState();

    if (game?.status !== "roundEnd") {
        return null;
    }

    return (
        <section className="space-y-6" aria-label={t("roundEnd.title")}>
            <div className="flex justify-end mb-2">
                <SettingsBar />
            </div>
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800" id="round-end-title">
                    {t("game.roundEnded")}
                </h1>
                <p className="text-sm text-gray-500" aria-label={t("game.round", { number: game.roundNumber })}>
                    {t("game.round", { number: game.roundNumber })}
                </p>
            </div>
            <ScoreDisplay />
            <Card className="max-w-md mx-auto">
                <section aria-labelledby="round-end-title">
                    <CardHeader>
                        <CardTitle>{t("roundEnd.title")}</CardTitle>
                        <CardDescription id="round-summary-description">
                            {game.toppleOccurred ? t("roundEnd.toppleOccurred") : t("roundEnd.allPiecesPlayed")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={startNewRound}
                            className="w-full text-lg py-6"
                            aria-label={t("roundEnd.startNewRound")}
                            aria-describedby="round-summary-description"
                        >
                            {t("roundEnd.startNewRound")}
                        </Button>
                    </CardContent>
                </section>
            </Card>
        </section>
    );
}
