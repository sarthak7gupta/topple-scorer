import { useTranslation } from "react-i18next";
import { useGameState } from "../../hooks/useGameState";
import { useSound } from "../../hooks/useSound";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export function ToppleButton() {
    const { t } = useTranslation();
    const { game, triggerTopple, currentPlayer } = useGameState();
    const { playSound } = useSound();

    if (game?.status !== "playing" || !currentPlayer) {
        return null;
    }

    const handleTopple = () => {
        if (currentPlayer) {
            playSound("topple");
            triggerTopple(currentPlayer.id);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto border-red-200" role="region" aria-label="Topple management">
            <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-red-600 text-base" id="topple-title">
                    {t("topple.title")}
                </CardTitle>
                <CardDescription className="text-xs" id="topple-description">
                    {t("topple.description")}
                </CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-3">
                <Button
                    onClick={handleTopple}
                    className="w-full bg-red-500 hover:bg-red-600 text-sm py-1.5"
                    aria-label={t("topple.ariaLabel", {
                        playerName: currentPlayer.name,
                    })}
                    aria-describedby="topple-description"
                >
                    {t("topple.buttonWithPlayer", {
                        playerName: currentPlayer.name,
                    })}
                </Button>
                <p className="text-xs text-gray-500 mt-1.5 text-center">{t("topple.message")}</p>
            </CardContent>
        </Card>
    );
}
