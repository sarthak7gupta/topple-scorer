import { useEffect, useMemo, useRef, useState } from "react";
import { getValidCells } from "../lib/game/board";
import type { Position } from "../lib/types/board";
import { useGameState } from "./useGameState";

/**
 * Custom hook for board operations
 */
export function useBoard() {
    const { game } = useGameState();
    const [showValidCells, setShowValidCells] = useState(false);
    const diceRollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const previousDiceRollRef = useRef<number | null | undefined>(undefined);
    const isInitialMountRef = useRef(true);

    // Delay showing valid cells until dice animation completes (1000ms)
    useEffect(() => {
        // Clear any existing timeout
        if (diceRollTimeoutRef.current) {
            clearTimeout(diceRollTimeoutRef.current);
            diceRollTimeoutRef.current = null;
        }

        const currentDiceRoll = game?.diceRoll || null;
        const previousDiceRoll = previousDiceRollRef.current;

        // On initial mount, if diceRoll is already set, show valid cells immediately
        if (isInitialMountRef.current) {
            isInitialMountRef.current = false;
            if (currentDiceRoll !== null) {
                setShowValidCells(true);
            }
        } else if (currentDiceRoll !== null && currentDiceRoll !== previousDiceRoll) {
            // Dice roll changed to a new value - wait for animation
            setShowValidCells(false);
            // Wait 1000ms (dice animation duration) before showing valid cells
            diceRollTimeoutRef.current = setTimeout(() => {
                setShowValidCells(true);
            }, 1000);
        } else if (currentDiceRoll === null) {
            // If diceRoll is cleared, hide valid cells immediately
            setShowValidCells(false);
        }

        // Update the ref to track the previous dice roll value
        previousDiceRollRef.current = currentDiceRoll;

        // Cleanup timeout on unmount
        return () => {
            if (diceRollTimeoutRef.current) {
                clearTimeout(diceRollTimeoutRef.current);
            }
        };
    }, [game?.diceRoll]);

    const validCells = useMemo(() => {
        // Only show valid cells after animation completes
        if (!game?.diceRoll || !game.board || !showValidCells) {
            return [];
        }
        return getValidCells(game.diceRoll, game.board);
    }, [game, showValidCells]);

    const isValidCell = (position: Position): boolean => {
        return validCells.some((cell) => cell.row === position.row && cell.col === position.col);
    };

    return {
        board: game?.board,
        validCells,
        isValidCell,
        diceRoll: game?.diceRoll,
    };
}
