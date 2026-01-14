import { useGameContext } from "./useGameContext";

/**
 * Custom hook for accessing and updating game state
 */
export function useGameState() {
    const context = useGameContext();

    return {
        game: context.state.game,
        isLoading: context.state.isLoading,
        setupGame: context.setupGame,
        rollDice: context.rollDice,
        placePiece: context.placePiece,
        triggerTopple: context.triggerTopple,
        endRound: context.endRound,
        startNewRound: context.startNewRound,
        resetGame: context.resetGame,
        loadGame: context.loadGame,
        dispatch: context.dispatch,
        currentPlayer: context.state.game?.players[context.state.game.currentPlayerIndex],
        isGameActive: context.state.game?.status === "playing",
        undo: context.undo,
        canUndo: context.canUndo,
        redo: context.redo,
        canRedo: context.canRedo,
        selectedColor: context.selectedColor,
        setSelectedColor: context.setSelectedColor,
    };
}
