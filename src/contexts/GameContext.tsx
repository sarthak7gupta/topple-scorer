import React, { createContext, useReducer, useEffect, ReactNode, useMemo, useCallback } from "react";
import { gameReducer, type GameAction } from "../lib/game/gameState";
import type { Game, GameConfig } from "../lib/types/game";
import type { Position } from "../lib/types/board";
import type { PlayerColor } from "../lib/types/player";
import { saveGame, loadGame } from "../lib/utils/storage";

interface GameState {
    game: Game | null;
    isLoading: boolean;
    history: Game[]; // History for undo functionality
    historyIndex: number; // Current position in history
}

interface GameContextValue {
    state: GameState;
    dispatch: React.Dispatch<GameAction>;
    // Convenience methods
    setupGame: (config: GameConfig) => void;
    rollDice: () => void;
    placePiece: (position: Position, color?: PlayerColor) => void;
    completeTurn: () => void;
    triggerTopple: (playerId: string) => void;
    endRound: () => void;
    startNewRound: () => void;
    resetGame: () => void;
    loadGame: (game: Game) => void;
    undo: () => void;
    canUndo: boolean;
    redo: () => void;
    canRedo: boolean;
    // 2-player mode color selection
    selectedColor: PlayerColor | null;
    setSelectedColor: (color: PlayerColor | null) => void;
}

export const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [game, dispatch] = useReducer(gameReducer, null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [history, setHistory] = React.useState<Game[]>([]);
    const [historyIndex, setHistoryIndex] = React.useState(-1);
    const [selectedColor, setSelectedColor] = React.useState<PlayerColor | null>(null);

    // Reset selected color when player changes or game resets
    React.useEffect(() => {
        if (!game) {
            setSelectedColor(null);
            return;
        }

        const currentPlayer = game.players[game.currentPlayerIndex];
        if (currentPlayer) {
            // If no color selected or selected color is not available for current player, set default
            // Only reset if the color is invalid for the current player
            setSelectedColor((prevColor) => {
                if (!prevColor) {
                    // In 2-player mode, default to 2nd color, otherwise use primary color
                    return currentPlayer.color2 || currentPlayer.color;
                }
                // If in 2-player mode, validate the color is one of the player's colors
                if (currentPlayer.color2 && prevColor !== currentPlayer.color && prevColor !== currentPlayer.color2) {
                    // Default to 2nd color in 2-player mode
                    return currentPlayer.color2;
                }
                // Keep the previous color if it's still valid
                return prevColor;
            });
        }
    }, [game, game?.currentPlayerIndex]);

    // Load game from localStorage on mount
    useEffect(() => {
        const savedGame = loadGame();
        if (savedGame) {
            dispatch({ type: "LOAD_GAME", payload: savedGame });
        }
        setIsLoading(false);
    }, []);

    // Save game to localStorage whenever it changes
    useEffect(() => {
        if (game) {
            saveGame(game);
        }
    }, [game]);

    // Track history for undo/redo functionality (separate effect to avoid loops)
    const isUndoingRef = React.useRef(false);
    const isRedoingRef = React.useRef(false);
    const lastHistoryTimestampRef = React.useRef<number | null>(null);

    // Extract values for dependency array
    const gameUpdatedAt = game?.updatedAt?.getTime();
    const gameStatus = game?.status;

    useEffect(() => {
        if (game?.status === "playing" && !isUndoingRef.current && !isRedoingRef.current) {
            // Only add to history if the game state has actually changed
            // Compare updatedAt timestamp to detect state changes
            const currentTimestamp = game.updatedAt?.getTime() || 0;
            const shouldAddToHistory =
                lastHistoryTimestampRef.current === null || lastHistoryTimestampRef.current !== currentTimestamp;

            if (shouldAddToHistory) {
                // Deep clone the game state
                const gameSnapshot = structuredClone(game);
                // Restore Date objects
                gameSnapshot.createdAt = new Date(game.createdAt);
                gameSnapshot.updatedAt = new Date(game.updatedAt);
                if (gameSnapshot.log) {
                    gameSnapshot.log = game.log.map((entry) => ({
                        ...entry,
                        timestamp: new Date(entry.timestamp),
                    }));
                }

                setHistory((prev) => {
                    // Remove any history after current index (if we're not at the end)
                    const newHistory = prev.slice(0, historyIndex + 1);
                    // Add new state
                    newHistory.push(gameSnapshot);
                    // Keep only last 50 states to prevent memory issues
                    return newHistory.slice(-50);
                });

                // Update historyIndex and timestamp after history is updated
                setHistoryIndex((prev) => {
                    const newIndex = prev + 1;
                    lastHistoryTimestampRef.current = currentTimestamp;
                    return Math.min(newIndex, 49);
                });
            }
        }
        isUndoingRef.current = false;
        isRedoingRef.current = false;
    }, [game, gameUpdatedAt, gameStatus, historyIndex]);

    // Wrap all function definitions in useCallback for stable references
    const setupGame = useCallback(
        (config: GameConfig) => {
            dispatch({ type: "SETUP_GAME", payload: config });
            // Reset history when starting a new game
            setHistory([]);
            setHistoryIndex(-1);
            lastHistoryTimestampRef.current = null;
        },
        [dispatch]
    );

    const rollDice = useCallback(() => {
        if (game?.status !== "playing") {
            console.warn("Cannot roll dice: game not ready", {
                hasGame: !!game,
                status: game?.status,
            });
            return;
        }
        const currentPlayer = game.players[game.currentPlayerIndex];
        if (!currentPlayer) {
            console.warn("Cannot roll dice: no current player", {
                currentPlayerIndex: game.currentPlayerIndex,
                players: game.players.map((p) => ({
                    name: p.name,
                    isActive: p.isActive,
                })),
            });
            return;
        }
        // Allow dispatch even if player appears inactive - reducer will handle activation
        // This fixes issues after round transitions where activation might not be synced
        dispatch({
            type: "ROLL_DICE",
            payload: { playerId: currentPlayer.id },
        });
    }, [game, dispatch]);

    const placePiece = useCallback(
        (position: Position, color?: PlayerColor) => {
            if (!game?.players[game.currentPlayerIndex]) return;
            dispatch({
                type: "PLACE_PIECE",
                payload: {
                    position,
                    playerId: game.players[game.currentPlayerIndex].id,
                    color,
                },
            });
        },
        [game, dispatch]
    );

    const completeTurn = useCallback(() => {
        dispatch({ type: "COMPLETE_TURN" });
    }, [dispatch]);

    const triggerTopple = useCallback(
        (playerId: string) => {
            dispatch({ type: "TOGGLE_TOPPLE", payload: { playerId } });
        },
        [dispatch]
    );

    const endRound = useCallback(() => {
        dispatch({ type: "END_ROUND" });
    }, [dispatch]);

    const startNewRound = useCallback(() => {
        dispatch({ type: "START_NEW_ROUND" });
    }, [dispatch]);

    const resetGame = useCallback(() => {
        dispatch({ type: "RESET_GAME" });
        // Clear history when resetting
        setHistory([]);
        setHistoryIndex(-1);
        lastHistoryTimestampRef.current = null;
    }, [dispatch]);

    const loadGameState = useCallback(
        (gameState: Game) => {
            dispatch({ type: "LOAD_GAME", payload: gameState });
            // Clear history when loading a game (unless it's an undo/redo operation)
            if (!isUndoingRef.current && !isRedoingRef.current) {
                setHistory([]);
                setHistoryIndex(-1);
                lastHistoryTimestampRef.current = null;
            }
        },
        [dispatch]
    );

    const undo = useCallback(() => {
        if (historyIndex > 0 && history.length > 0) {
            isUndoingRef.current = true;
            const previousIndex = historyIndex - 1;
            const previousGame = history[previousIndex];
            if (previousGame) {
                dispatch({ type: "LOAD_GAME", payload: previousGame });
                setHistoryIndex(previousIndex);
                lastHistoryTimestampRef.current = previousGame.updatedAt?.getTime() || null;
            }
        }
    }, [dispatch, history, historyIndex]);

    const canUndo = historyIndex > 0 && history.length > 0;

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1 && history.length > 0) {
            isRedoingRef.current = true;
            const nextIndex = historyIndex + 1;
            const nextGame = history[nextIndex];
            if (nextGame) {
                dispatch({ type: "LOAD_GAME", payload: nextGame });
                setHistoryIndex(nextIndex);
                lastHistoryTimestampRef.current = nextGame.updatedAt?.getTime() || null;
            }
        }
    }, [dispatch, history, historyIndex]);

    const canRedo = historyIndex < history.length - 1 && history.length > 0;

    // Initialize selected color for 2-player mode when dice is rolled (if not already set)
    // Don't reset when dice roll is cleared - allow color selection before rolling
    useEffect(() => {
        if (game?.diceRoll && game.players[game.currentPlayerIndex]?.color2) {
            // In 2-player mode, automatically select the 2nd color when dice is rolled (only if not already selected)
            const currentPlayer = game.players[game.currentPlayerIndex];
            if (!selectedColor && currentPlayer.color2) {
                setSelectedColor(currentPlayer.color2);
            }
        }
    }, [game, game?.diceRoll, game?.currentPlayerIndex, game?.players, selectedColor]);

    const value: GameContextValue = useMemo(
        () => ({
            state: { game, isLoading, history, historyIndex },
            dispatch,
            setupGame,
            rollDice,
            placePiece,
            completeTurn,
            triggerTopple,
            endRound,
            startNewRound,
            resetGame,
            loadGame: loadGameState,
            undo,
            canUndo,
            redo,
            canRedo,
            selectedColor,
            setSelectedColor,
        }),
        [
            game,
            isLoading,
            history,
            historyIndex,
            dispatch,
            setupGame,
            rollDice,
            placePiece,
            completeTurn,
            triggerTopple,
            endRound,
            startNewRound,
            resetGame,
            loadGameState,
            undo,
            canUndo,
            redo,
            canRedo,
            selectedColor,
            setSelectedColor,
        ]
    );

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
