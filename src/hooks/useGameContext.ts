import { useContext } from "react";
import { GameContext } from "../contexts/GameContext";

/**
 * Hook to access the game context
 * Must be used within a GameProvider
 */
export function useGameContext() {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error("useGameContext must be used within a GameProvider");
    }
    return context;
}
