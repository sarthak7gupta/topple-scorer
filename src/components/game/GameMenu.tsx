import { useTranslation } from "react-i18next";
import { useGameState } from "../../hooks/useGameState";
import { LanguageSelector } from "../settings/LanguageSelector";
import { SoundToggle } from "../settings/SoundToggle";
import { Button } from "../ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import { Menu, Home } from "lucide-react";

export function GameMenu() {
    const { t } = useTranslation();
    const { game, resetGame } = useGameState();

    if (!game || game.status === "setup") {
        return null;
    }

    const handleReset = () => {
        if (confirm(t("menu.resetConfirm"))) {
            resetGame();
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    title={t("menu.title")}
                    aria-label={t("menu.title")}
                    id="game-menu-button"
                >
                    <Menu className="w-4 h-4 mr-2" aria-hidden="true" />
                    <span>{t("common.menu")}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{t("menu.title")}</DialogTitle>
                    <DialogDescription>{t("menu.description")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 overflow-y-auto flex-1 min-h-0">
                    <div className="space-y-2">
                        <h3 className="font-semibold text-foreground">{t("menu.currentGame")}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t("menu.status", {
                                round: game.roundNumber,
                                status: game.status,
                            })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {t("menu.players", {
                                count: game.players.length,
                                points: game.victoryPoints,
                            })}
                        </p>
                    </div>
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-3 text-foreground">{t("common.settings")}</h3>
                        <div className="space-y-4">
                            <SoundToggle />
                            <LanguageSelector />
                        </div>
                    </div>
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-2 text-foreground">{t("menu.keyboardShortcuts")}</h3>
                        <div className="text-sm space-y-2 text-muted-foreground">
                            <div className="flex items-center gap-2 flex-wrap">
                                <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded shadow-sm">
                                    Cmd / Ctrl
                                </kbd>
                                <span className="text-muted-foreground">+</span>
                                <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded shadow-sm">
                                    /
                                </kbd>
                                <span className="text-muted-foreground">- {t("menu.shortcutMenu")}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded shadow-sm">
                                    Space
                                </kbd>
                                <span className="text-muted-foreground">{t("common.or")}</span>
                                <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded shadow-sm">
                                    Enter
                                </kbd>
                                <span className="text-muted-foreground">- {t("dice.rollDice")}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded shadow-sm">
                                    M
                                </kbd>
                                <span className="text-muted-foreground">- {t("menu.shortcutSound")}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded shadow-sm">
                                    Cmd / Ctrl
                                </kbd>
                                <span className="text-muted-foreground">+</span>
                                <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded shadow-sm">
                                    Z
                                </kbd>
                                <span className="text-muted-foreground">- {t("common.undo")}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded shadow-sm">
                                    Cmd / Ctrl
                                </kbd>
                                <span className="text-muted-foreground">+</span>
                                <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded shadow-sm">
                                    Y
                                </kbd>
                                <span className="text-muted-foreground">{t("common.or")}</span>
                                <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded shadow-sm">
                                    Cmd / Ctrl
                                </kbd>
                                <span className="text-muted-foreground">+</span>
                                <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded shadow-sm">
                                    Shift
                                </kbd>
                                <span className="text-muted-foreground">+</span>
                                <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded shadow-sm">
                                    Z
                                </kbd>
                                <span className="text-muted-foreground">- {t("common.redo")}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded shadow-sm">
                                    R
                                </kbd>
                                <span className="text-muted-foreground">- {t("common.reset")}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded shadow-sm">
                                    Esc
                                </kbd>
                                <span className="text-muted-foreground">- {t("common.close")}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        variant="destructive"
                        onClick={handleReset}
                        className="w-full sm:w-auto"
                        aria-label={t("menu.resetGame")}
                    >
                        <Home className="w-4 h-4 mr-2" aria-hidden="true" />
                        <span>{t("menu.resetGame")}</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
