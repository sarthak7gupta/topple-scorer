import { useState } from "react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { GameProvider } from "./contexts/GameContext";
import { GameLayout } from "./components/layout/GameLayout";
import { WelcomeScreen } from "./components/game/WelcomeScreen";
import { GameSetup } from "./components/game/GameSetup";
import { InitialDiceRoll } from "./components/game/InitialDiceRoll";
import { RoundEndScreen } from "./components/game/RoundEndScreen";
import { GameEndScreen } from "./components/game/GameEndScreen";
import { DiceRoll } from "./components/game/DiceRoll";
import { ScoreDisplay } from "./components/game/ScoreDisplay";
import { GameLog } from "./components/game/GameLog";
import { GameMenu } from "./components/game/GameMenu";
import { HelpDialog } from "./components/game/HelpDialog";
import { Button } from "./components/ui/button";
import { Undo2, Redo2 } from "lucide-react";
import { Board } from "./components/board/Board";
import { AnalyticsDashboard } from "./components/analytics/AnalyticsDashboard";
import { SettingsBar } from "./components/settings/SettingsBar";
import { useGameState } from "./hooks/useGameState";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import "./index.css";

function GameContent() {
    const { game, isLoading, undo, canUndo, redo, canRedo } = useGameState();
    const [showWelcome, setShowWelcome] = useState(() => {
        // Check if there's a saved game - if so, don't show welcome
        const savedGame = localStorage.getItem("topple-game-state");
        return !savedGame;
    });

    // Reset welcome screen when game is reset
    React.useEffect(() => {
        if (!game) {
            setShowWelcome(true);
        }
    }, [game]);

    // Enable keyboard shortcuts
    useKeyboardShortcuts();

    const { t } = useTranslation();

    if (isLoading) {
        return (
            <>
                <div className="flex justify-end mb-2">
                    <SettingsBar />
                </div>
                <div className="text-center">
                    <p className="text-gray-600">{t("common.loading")}</p>
                </div>
            </>
        );
    }

    // Show welcome screen if not started yet and no game exists
    if (showWelcome && (!game || game.status === "setup")) {
        return <WelcomeScreen onStart={() => setShowWelcome(false)} />;
    }

    if (!game || game.status === "setup") {
        return <GameSetup />;
    }

    // Show initial dice roll ONLY at the start of round 1, before any gameplay
    // Check if gameplay has started by looking for pieces on the board or gameplay log entries
    const hasPiecesOnBoard = game.board.cells.some((row) => row.some((cell) => cell.stack.length > 0));
    const hasGameplayLogEntries = game.log.some(
        (entry) => entry.type === "dice_roll" || entry.type === "placement" || entry.type === "score"
    );
    const gameplayHasStarted = hasPiecesOnBoard || hasGameplayLogEntries;

    const currentPlayer = game.players[game.currentPlayerIndex];
    const needsInitialRoll =
        game.roundNumber === 1 &&
        !gameplayHasStarted &&
        (game.players.every((p) => !p.isActive) || (currentPlayer && !currentPlayer.isActive));

    if (needsInitialRoll) {
        return <InitialDiceRoll />;
    }

    // Show round end / new round UI
    if (game.status === "roundEnd") {
        return <RoundEndScreen />;
    }

    // Show game end screen
    if (game.status === "gameEnd") {
        return <GameEndScreen />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end mb-2">
                <SettingsBar />
            </div>
            <div className="text-center">
                <div className="flex items-center justify-between mb-2 gap-2">
                    <div className="flex-1" />
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold text-gray-800">{t("game.title")}</h1>
                        <p className="text-sm text-gray-500">{t("game.round", { number: game.roundNumber })}</p>
                    </div>
                    <div className="flex-1 flex justify-end gap-2 flex-wrap">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => undo()}
                            disabled={!canUndo}
                            title={
                                canUndo ? t("menu.undoLastAction") + " (or press Cmd/Ctrl+Z)" : t("menu.cannotUndo")
                            }
                            aria-label={canUndo ? t("menu.undoLastAction") : t("menu.cannotUndo")}
                        >
                            <Undo2 className="w-4 h-4 mr-2" aria-hidden="true" />
                            <span>{t("common.undo")}</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => redo()}
                            disabled={!canRedo}
                            title={
                                canRedo
                                    ? t("menu.redoLastAction") + " (or press Cmd/Ctrl+Y or Cmd/Ctrl+Shift+Z)"
                                    : t("menu.cannotRedo")
                            }
                            aria-label={canRedo ? t("menu.redoLastAction") : t("menu.cannotRedo")}
                        >
                            <Redo2 className="w-4 h-4 mr-2" aria-hidden="true" />
                            <span>{t("common.redo")}</span>
                        </Button>
                        <HelpDialog />
                        <GameMenu />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main game area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <ScoreDisplay />
                        <DiceRoll />
                    </div>
                    <Board />
                </div>

                {/* Game log sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <GameLog />
                    <AnalyticsDashboard />
                </div>
            </div>
        </div>
    );
}

function App() {
    return (
        <GameProvider>
            <GameLayout>
                <GameContent />
            </GameLayout>
        </GameProvider>
    );
}

export default App;
