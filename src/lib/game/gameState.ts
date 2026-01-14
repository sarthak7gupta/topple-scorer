import type { Position } from "../types/board";
import type { Game, GameConfig, GameStatus } from "../types/game";
import type { Player, PlayerColor } from "../types/player";
import { rollDice } from "../utils/dice";
import { canPlacePiece, createEmptyBoard, placePiece } from "./board";
import { endRound, startNewRound } from "./round";
import { calculateScore } from "./scoring";
// Simple UUID generator (avoiding external dependency for now)
function uuidv4(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replaceAll(/[xy]/g, (c: string) => {
        const r = Math.trunc(Math.random() * 16);
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

// Game actions
export type GameAction =
    | { type: "SETUP_GAME"; payload: GameConfig }
    | {
          type: "INITIAL_DICE_ROLL";
          payload: {
              rolls: Array<{ playerId: string; roll: number }>;
              playerOrder?: string[];
          };
      }
    | { type: "ROLL_DICE"; payload: { playerId: string } }
    | {
          type: "PLACE_PIECE";
          payload: {
              position: Position;
              playerId: string;
              color?: PlayerColor;
          };
      }
    | { type: "COMPLETE_TURN" }
    | { type: "TOGGLE_TOPPLE"; payload: { playerId: string } }
    | { type: "END_ROUND" }
    | { type: "START_NEW_ROUND" }
    | { type: "RESET_GAME" }
    | { type: "LOAD_GAME"; payload: Game }
    | { type: "UNDO" }
    | { type: "SET_ERROR"; payload: string };

/**
 * Creates a new player
 */
function createPlayer(
    id: string,
    name: string,
    color: PlayerColor,
    color2: PlayerColor | undefined,
    order: number
): Player {
    const isTwoPlayerMode = !!color2;
    const piecesRemainingByColor: Record<PlayerColor, number> | undefined = isTwoPlayerMode
        ? {
              pink: color === "pink" || color2 === "pink" ? 12 : 0,
              yellow: color === "yellow" || color2 === "yellow" ? 12 : 0,
              orange: color === "orange" || color2 === "orange" ? 12 : 0,
              purple: color === "purple" || color2 === "purple" ? 12 : 0,
          }
        : undefined;

    const scoreByColor: Record<PlayerColor, number> | undefined = isTwoPlayerMode
        ? {
              pink: 0,
              yellow: 0,
              orange: 0,
              purple: 0,
          }
        : undefined;

    return {
        id,
        name,
        color,
        color2,
        score: 0,
        scoreByColor,
        piecesRemaining: 12,
        piecesRemainingByColor,
        totalPieces: 12,
        order,
        isActive: false,
    };
}

/**
 * Creates a new piece
 */
function createPiece(playerId: string, color: PlayerColor, roundNumber: number): import("../types/game").Piece {
    return {
        id: uuidv4(),
        playerId,
        color,
        placedAt: new Date(),
        roundNumber,
    };
}

/**
 * Initializes a new game from configuration
 */
function initializeGame(config: GameConfig): Game {
    const players: Player[] = config.players.map((p, index) =>
        createPlayer(`player-${index + 1}`, p.name, p.color, p.color2, p.order)
    );

    // No player is active initially - will be determined by initial dice roll
    // All players start with isActive: false

    return {
        id: uuidv4(),
        status: "playing", // Start in playing mode - initial dice roll will happen
        players,
        currentPlayerIndex: 0, // Will be updated after initial dice roll
        roundNumber: 1,
        victoryPoints: config.victoryPoints,
        board: createEmptyBoard(),
        diceRoll: undefined,
        toppleOccurred: false,
        topplePlayerId: undefined,
        diceRolledInRound: false,
        log: [
            {
                id: uuidv4(),
                type: "round_start",
                message: "Game started - Round 1",
                timestamp: new Date(),
                roundNumber: 1,
            },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

/**
 * Game state reducer
 */
export function gameReducer(state: Game | null, action: GameAction): Game | null {
    if (!state && action.type !== "SETUP_GAME" && action.type !== "LOAD_GAME") {
        return null;
    }

    switch (action.type) {
        case "SETUP_GAME": {
            const game = initializeGame(action.payload);
            // Game starts in 'playing' mode, ready for initial dice roll
            return game;
        }

        case "INITIAL_DICE_ROLL": {
            if (!state) return state;

            const { rolls, playerOrder } = action.payload;
            const maxRoll = Math.max(...rolls.map((r) => r.roll));
            const winners = rolls.filter((r) => r.roll === maxRoll);

            // Reorder players clockwise based on initial order
            // If playerOrder is provided (from UI reordering), use it; otherwise use initial order
            let playersToUse = state.players;
            if (playerOrder && playerOrder.length === state.players.length) {
                // Use the manually reordered list from UI
                playersToUse = playerOrder
                    .map((playerId: string) => {
                        const player = state.players.find((p: Player) => p.id === playerId);
                        return player!;
                    })
                    .filter(Boolean)
                    .map((p: Player, i: number) => ({ ...p, order: i }));
                // Automatically reorder clockwise from winner based on initial order
            } else if (winners.length === 1) {
                const winner = state.players.find((p) => p.id === winners[0].playerId);
                if (winner) {
                    // Sort players by initial order, then rotate so winner is first
                    const sortedByOrder = [...state.players].sort((a, b) => a.order - b.order);
                    const winnerOrderIndex = sortedByOrder.findIndex((p) => p.id === winner.id);
                    if (winnerOrderIndex !== -1) {
                        // Rotate array so winner is first (clockwise order)
                        playersToUse = [
                            ...sortedByOrder.slice(winnerOrderIndex),
                            ...sortedByOrder.slice(0, winnerOrderIndex),
                        ].map((p, i) => ({ ...p, order: i }));
                    }
                }
            }

            if (winners.length === 1) {
                // Single winner - set as starting player (should be at index 0 after reordering)
                const winnerIndex = playersToUse.findIndex((p) => p.id === winners[0].playerId);
                if (winnerIndex !== -1) {
                    const newPlayers = playersToUse.map((p, i) => ({
                        ...p,
                        isActive: i === winnerIndex,
                    }));
                    return {
                        ...state,
                        players: newPlayers,
                        currentPlayerIndex: winnerIndex,
                        updatedAt: new Date(),
                    };
                }
            }
            // If multiple winners (tie), they need to roll again
            // This will be handled by the UI component
            // But still update player order if provided
            if (playerOrder && playerOrder.length === state.players.length) {
                return {
                    ...state,
                    players: playersToUse,
                    updatedAt: new Date(),
                };
            }
            return state;
        }

        case "LOAD_GAME": {
            return action.payload;
        }

        case "RESET_GAME": {
            return null;
        }

        case "ROLL_DICE": {
            if (state?.status !== "playing") return state;

            const currentPlayer = state.players[state.currentPlayerIndex];
            if (!currentPlayer) return state;

            // Safety check: If player is not active, activate them and continue
            // This handles state inconsistencies (e.g., after round transitions)
            let playersToUse = state.players;
            if (!currentPlayer.isActive) {
                playersToUse = state.players.map((p, i) => ({
                    ...p,
                    isActive: i === state.currentPlayerIndex,
                }));
            }

            const activePlayer = playersToUse[state.currentPlayerIndex];
            if (!activePlayer) return state;

            // Double-check: if player is still not active after activation, force activate
            if (!activePlayer.isActive) {
                playersToUse = playersToUse.map((p, i) => ({
                    ...p,
                    isActive: i === state.currentPlayerIndex,
                }));
            }

            const finalActivePlayer = playersToUse[state.currentPlayerIndex];
            if (!finalActivePlayer) return state;

            const roll = rollDice();
            const logEntries = Array.isArray(state.log) ? state.log : [];
            const logEntry = {
                id: uuidv4(),
                type: "dice_roll" as const,
                message: `${finalActivePlayer.name} rolled a ${roll}`,
                playerId: finalActivePlayer.id,
                playerName: finalActivePlayer.name,
                timestamp: new Date(),
                roundNumber: state.roundNumber,
            };

            return {
                ...state,
                players: playersToUse, // Ensure players are updated with active status
                diceRoll: roll,
                diceRolledInRound: true, // Mark that dice were rolled in this round
                log: [...logEntries, logEntry],
                updatedAt: new Date(),
            };
        }

        case "PLACE_PIECE": {
            if (!state?.diceRoll || state.status !== "playing") return state;

            const { position, playerId, color } = action.payload;
            const player = state.players.find((p) => p.id === playerId);
            if (!player || !player.isActive || player.piecesRemaining === 0) return state;

            // Validate placement
            if (!canPlacePiece(position, state.diceRoll, state.board)) {
                return state;
            }

            // Store previous board for scoring calculations
            const previousBoard = structuredClone(state.board);

            // Determine color to use (for 2-player mode)
            const pieceColor = color || player.color;

            // Validate color selection for 2-player mode
            if (player.color2 && color) {
                // In 2-player mode, color must be either color or color2
                if (color !== player.color && color !== player.color2) {
                    return state; // Invalid color selection
                }
            }

            // Check if player has pieces remaining for this color (2-player mode)
            if (player.color2 && player.piecesRemainingByColor) {
                const remainingForColor = player.piecesRemainingByColor[pieceColor] || 0;
                if (remainingForColor === 0) {
                    return state; // No pieces remaining for this color
                }
            } else if (player.piecesRemaining === 0) {
                return state; // No pieces remaining (regular mode)
            }

            // Create piece
            const piece = createPiece(playerId, pieceColor, state.roundNumber);

            // Place piece on board
            const newBoard = placePiece(state.board, position, piece);

            // Calculate scores (pass selected color for 2-player mode filtering)
            const scoreEvents = calculateScore(newBoard, position, player, previousBoard, pieceColor);

            // Update player score and pieces remaining
            let totalScoreIncrease = 0;
            scoreEvents.forEach((event) => {
                totalScoreIncrease += event.points;
                event.roundNumber = state.roundNumber;
            });

            const newPlayers = state.players.map((p) => {
                if (p.id !== playerId) return p;

                // Update pieces remaining
                let newPiecesRemaining = p.piecesRemaining - 1;
                let newPiecesRemainingByColor = p.piecesRemainingByColor;

                if (p.color2 && newPiecesRemainingByColor) {
                    // In 2-player mode, decrement the specific color's count
                    newPiecesRemainingByColor = {
                        ...newPiecesRemainingByColor,
                        [pieceColor]: Math.max(0, (newPiecesRemainingByColor[pieceColor] || 0) - 1),
                    };
                    // Total pieces remaining is sum of both colors
                    newPiecesRemaining = Object.values(newPiecesRemainingByColor).reduce(
                        (sum, count) => sum + count,
                        0
                    );
                }

                // Update score - in 2-player mode, update color-specific score
                let newScore = p.score + totalScoreIncrease;
                let newScoreByColor = p.scoreByColor;

                if (p.color2 && newScoreByColor && totalScoreIncrease > 0) {
                    // In 2-player mode, update the color-specific score
                    newScoreByColor = {
                        ...newScoreByColor,
                        [pieceColor]: (newScoreByColor[pieceColor] || 0) + totalScoreIncrease,
                    };
                    // Total score is sum of both color scores
                    newScore = Object.values(newScoreByColor).reduce((sum, score) => sum + score, 0);
                }

                return {
                    ...p,
                    piecesRemaining: newPiecesRemaining,
                    piecesRemainingByColor: newPiecesRemainingByColor,
                    score: newScore,
                    scoreByColor: newScoreByColor,
                };
            });

            // Add log entries for placement and scoring
            const logEntries = [];
            const baseTimestamp = new Date();

            // Placement log
            logEntries.push({
                id: uuidv4(),
                type: "placement" as const,
                message: `${player.name} placed a piece at row ${position.row + 1}, col ${position.col + 1}`,
                playerId: player.id,
                playerName: player.name,
                position,
                timestamp: baseTimestamp,
                roundNumber: state.roundNumber,
            });

            // Score logs (ensure they come after placement chronologically)
            scoreEvents.forEach((event, index) => {
                let reasonLabel: string;
                if (event.reason === "row_completion") {
                    reasonLabel = "Row completion";
                } else if (event.reason === "completed_row_bonus") {
                    reasonLabel = "Completed row bonus";
                } else {
                    reasonLabel = "Tall stack";
                }

                // Use the details field if available (contains specific row/column/diagonal info)
                const detailsText = event.details ? ` (${event.details})` : ` (${reasonLabel})`;

                logEntries.push({
                    id: uuidv4(),
                    type: "score" as const,
                    message: `${player.name} scored ${event.points} points${detailsText}`,
                    playerId: player.id,
                    playerName: player.name,
                    points: event.points,
                    timestamp: new Date(baseTimestamp.getTime() + index + 1), // Ensure score events come after placement
                    roundNumber: state.roundNumber,
                });
            });

            // Check if all pieces are played
            const allPiecesPlayed = newPlayers.every((p) => p.piecesRemaining === 0);

            // If all pieces are played and no topple occurred, apply -3 penalty to last player
            // BUT only if dice were rolled in this round
            let finalPlayers = newPlayers;
            if (allPiecesPlayed && !state.toppleOccurred && state.diceRolledInRound) {
                // Find the last player (the one who just played)
                const lastPlayerIndex = state.currentPlayerIndex;
                const lastPlayer = finalPlayers[lastPlayerIndex];
                if (lastPlayer) {
                    finalPlayers = finalPlayers.map((p, i) =>
                        i === lastPlayerIndex ? { ...p, score: p.score - 3 } : p
                    );

                    // Add penalty log entry
                    logEntries.push({
                        id: uuidv4(),
                        type: "score" as const,
                        message: `${lastPlayer.name} lost 3 points (last player when all pieces played)`,
                        playerId: lastPlayer.id,
                        playerName: lastPlayer.name,
                        points: -3,
                        timestamp: new Date(baseTimestamp.getTime() + scoreEvents.length + 1),
                        roundNumber: state.roundNumber,
                    });
                }
            }

            // Move to next player automatically after placement
            const nextPlayerIndex = (state.currentPlayerIndex + 1) % finalPlayers.length;
            const playersWithActiveStatus = finalPlayers.map((p, i) => ({
                ...p,
                isActive: i === nextPlayerIndex,
            }));

            // If all pieces are played, end the round (game end will be checked in endRound)
            const newStatus: GameStatus = allPiecesPlayed ? "roundEnd" : state.status;
            const updatedState = {
                ...state,
                board: newBoard,
                players: playersWithActiveStatus,
                currentPlayerIndex: nextPlayerIndex,
                diceRoll: undefined,
                log: [...state.log, ...logEntries],
                status: newStatus,
                updatedAt: new Date(),
            };

            // If round ended, check if game should end
            if (newStatus === "roundEnd") {
                return endRound(updatedState);
            }

            return updatedState;
        }

        case "COMPLETE_TURN": {
            if (state?.status !== "playing") return state;

            // Move to next player
            const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
            const newPlayers = state.players.map((p, i) => ({
                ...p,
                isActive: i === nextPlayerIndex,
            }));

            return {
                ...state,
                players: newPlayers,
                currentPlayerIndex: nextPlayerIndex,
                diceRoll: undefined,
                updatedAt: new Date(),
            };
        }

        case "TOGGLE_TOPPLE": {
            if (state?.status !== "playing") return state;

            const { playerId } = action.payload;
            const previousPlayerIndex =
                state.currentPlayerIndex > 0 ? state.currentPlayerIndex - 1 : state.players.length - 1;
            const previousPlayer = state.players[previousPlayerIndex];
            const causingPlayer = state.players.find((p) => p.id === playerId);

            if (!causingPlayer) return state;

            // Apply topple penalty and bonus
            const newPlayers = state.players.map((p) => {
                if (p.id === playerId) {
                    // In 2-player mode, we need to determine which color to penalize
                    // For now, we'll apply the penalty to the total score
                    // In a more sophisticated implementation, we could track which color caused the topple
                    let newScore = p.score - 10;
                    let newScoreByColor = p.scoreByColor;

                    if (p.color2 && newScoreByColor) {
                        // Apply penalty to both colors proportionally, or to the color with more pieces
                        // For simplicity, apply to the color that was last played
                        // We'll need to track the last played color, but for now, split evenly
                        const color1Score = newScoreByColor[p.color] || 0;
                        const color2Score = newScoreByColor[p.color2] || 0;
                        const totalColorScore = color1Score + color2Score;

                        if (totalColorScore > 0) {
                            // Split penalty proportionally
                            const color1Penalty = Math.round((color1Score / totalColorScore) * 10);
                            const color2Penalty = 10 - color1Penalty;

                            newScoreByColor = {
                                ...newScoreByColor,
                                [p.color]: Math.max(0, color1Score - color1Penalty),
                                [p.color2]: Math.max(0, color2Score - color2Penalty),
                            };
                            newScore = Object.values(newScoreByColor).reduce((sum, score) => sum + score, 0);
                        } else {
                            // No score yet, apply to first color
                            newScoreByColor = {
                                ...newScoreByColor,
                                [p.color]: Math.max(0, (newScoreByColor[p.color] || 0) - 10),
                            };
                            newScore = Object.values(newScoreByColor).reduce((sum, score) => sum + score, 0);
                        }
                    }

                    return {
                        ...p,
                        score: newScore,
                        scoreByColor: newScoreByColor,
                    };
                }
                if (p.id === previousPlayer.id) {
                    // Bonus goes to previous player
                    let newScore = p.score + 3;
                    let newScoreByColor = p.scoreByColor;

                    if (p.color2 && newScoreByColor) {
                        // Apply bonus to the color with more pieces, or split evenly
                        const color1Score = newScoreByColor[p.color] || 0;
                        const color2Score = newScoreByColor[p.color2] || 0;

                        if (color1Score >= color2Score) {
                            newScoreByColor = {
                                ...newScoreByColor,
                                [p.color]: color1Score + 3,
                            };
                        } else {
                            newScoreByColor = {
                                ...newScoreByColor,
                                [p.color2]: color2Score + 3,
                            };
                        }
                        newScore = Object.values(newScoreByColor).reduce((sum, score) => sum + score, 0);
                    }

                    return {
                        ...p,
                        score: newScore,
                        scoreByColor: newScoreByColor,
                    };
                }
                return p;
            });

            // Add topple log entry
            const toppleLogEntry = {
                id: uuidv4(),
                type: "topple" as const,
                message: `${causingPlayer.name} caused a topple! (-10 points)`,
                playerId: causingPlayer.id,
                playerName: causingPlayer.name,
                points: -10,
                timestamp: new Date(),
                roundNumber: state.roundNumber,
            };

            const previousPlayerLogEntry = {
                id: uuidv4(),
                type: "score" as const,
                message: `${previousPlayer.name} received +3 bonus for topple`,
                playerId: previousPlayer.id,
                playerName: previousPlayer.name,
                points: 3,
                timestamp: new Date(),
                roundNumber: state.roundNumber,
            };

            const updatedState = {
                ...state,
                players: newPlayers,
                toppleOccurred: true,
                topplePlayerId: playerId,
                log: [...state.log, toppleLogEntry, previousPlayerLogEntry],
                status: "roundEnd" as const,
                updatedAt: new Date(),
            };

            // Check for game end
            return endRound(updatedState);
        }

        case "END_ROUND": {
            if (!state) return state;
            return endRound(state);
        }

        case "START_NEW_ROUND": {
            if (state?.status !== "roundEnd") return state;
            return startNewRound(state);
        }

        case "SET_ERROR": {
            // Error handling - could be extended
            console.error("Game error:", action.payload);
            return state;
        }

        default:
            return state;
    }
}
