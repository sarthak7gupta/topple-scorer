import type { Game } from "../types/game";
import type { Player } from "../types/player";
import { createEmptyBoard } from "./board";

/**
 * Checks if the game should end
 */
export function checkGameEnd(game: Game): boolean {
    // Game ends when:
    // 1. Round has ended (topple occurred OR all pieces played)
    // 2. At least one player has reached victory points
    if (game.status !== "roundEnd") {
        return false;
    }

    const hasWinner = game.players.some((p) => p.score >= game.victoryPoints);
    return hasWinner;
}

/**
 * Determines the winner of the game
 */
export function determineWinner(game: Game): Player | null {
    if (game.status !== "gameEnd") {
        return null;
    }

    // Find all players who reached victory points
    const winners = game.players.filter((p) => p.score >= game.victoryPoints);

    if (winners.length === 0) {
        return null;
    }

    // If multiple players reached victory points, highest score wins
    return winners.reduce((prev, current) => (current.score > prev.score ? current : prev), winners[0]);
}

/**
 * Ends a round
 */
export function endRound(game: Game): Game {
    // Check if game should end
    if (checkGameEnd(game)) {
        const winner = determineWinner({
            ...game,
            status: "gameEnd",
        });

        // Build game end message
        let gameEndMessage: string;
        if (winner) {
            const multipleWinners = game.players.filter((p) => p.score >= game.victoryPoints).length > 1;
            const winnerSuffix = multipleWinners ? " (highest score among players who reached victory points)" : "";
            gameEndMessage = `Game ended! ${winner.name} won with ${winner.score} points${winnerSuffix}`;
        } else {
            gameEndMessage = `Game ended! A player reached ${game.victoryPoints} victory points`;
        }

        const gameEndLog = {
            id: `game-end-${Date.now()}`,
            type: "game_end" as const,
            message: gameEndMessage,
            playerId: winner?.id,
            playerName: winner?.name,
            timestamp: new Date(),
            roundNumber: game.roundNumber,
        };

        return {
            ...game,
            status: "gameEnd",
            log: [...game.log, gameEndLog],
            updatedAt: new Date(),
        };
    }

    // Add round end log entry when round ends
    // Use a timestamp that's guaranteed to be after any logs added in the same action
    // (e.g., topple logs) by adding 1ms to ensure correct chronological order
    const roundEndTimestamp = new Date(Date.now() + 1);
    const roundEndLog = {
        id: `round-${game.roundNumber}-end-${Date.now()}`,
        type: "round_end" as const,
        message: `Round ${game.roundNumber} ended${
            game.toppleOccurred ? " (topple occurred)" : " (all pieces played)"
        }`,
        timestamp: roundEndTimestamp,
        roundNumber: game.roundNumber,
    };

    return {
        ...game,
        status: "roundEnd",
        log: [...game.log, roundEndLog],
        updatedAt: new Date(),
    };
}

/**
 * Starts a new round
 */
export function startNewRound(game: Game): Game {
    if (game.status !== "roundEnd") {
        return game;
    }

    // Always clear the board for the new round
    const newBoard = createEmptyBoard();

    // Reset pieces and active status
    const newPlayers = game.players.map((p, i) => {
        // Reset pieces remaining
        let piecesRemainingByColor = p.piecesRemainingByColor;
        if (p.color2 && piecesRemainingByColor) {
            // Reset per-color counts in 2-player mode
            piecesRemainingByColor = {
                pink: p.color === "pink" || p.color2 === "pink" ? 12 : 0,
                yellow: p.color === "yellow" || p.color2 === "yellow" ? 12 : 0,
                orange: p.color === "orange" || p.color2 === "orange" ? 12 : 0,
                purple: p.color === "purple" || p.color2 === "purple" ? 12 : 0,
            };
        }

        return {
            ...p,
            piecesRemaining: 12,
            piecesRemainingByColor,
            isActive: i === 0, // Set first player as active
        };
    });

    const newRoundNumber = game.roundNumber + 1;

    // Add round start log entry (round end log was already added in endRound)
    const roundStartLog = {
        id: `round-${newRoundNumber}-start-${Date.now()}`,
        type: "round_start" as const,
        message: `Round ${newRoundNumber} started`,
        timestamp: new Date(),
        roundNumber: newRoundNumber,
    };

    return {
        ...game,
        board: newBoard,
        players: newPlayers,
        roundNumber: newRoundNumber,
        currentPlayerIndex: 0,
        diceRoll: undefined,
        toppleOccurred: false,
        topplePlayerId: undefined,
        diceRolledInRound: false, // Reset for new round
        log: [...game.log, roundStartLog],
        status: "playing",
        updatedAt: new Date(),
    };
}
