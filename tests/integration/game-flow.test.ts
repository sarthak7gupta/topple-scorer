import { beforeEach, describe, expect, it } from "vitest";
import { createEmptyBoard, getValidCells, placePiece } from "../../src/lib/game/board";
import { gameReducer } from "../../src/lib/game/gameState";
import { checkGameEnd, determineWinner, endRound, startNewRound } from "../../src/lib/game/round";
import { calculateScore } from "../../src/lib/game/scoring";
import type { GameConfig, Piece } from "../../src/lib/types/game";

describe("Game Flow Integration", () => {
    let gameConfig: GameConfig;

    beforeEach(() => {
        gameConfig = {
            playerCount: 2,
            players: [
                { name: "Alice", color: "pink", order: 0 },
                { name: "Bob", color: "yellow", order: 1 },
            ],
            victoryPoints: 20,
        };
    });

    describe("Complete Game Flow", () => {
        it("should handle full turn: setup -> dice roll -> place piece -> score -> complete turn", () => {
            // Setup game
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });

            expect(game).not.toBeNull();
            expect(game?.status).toBe("playing");
            expect(game?.players).toHaveLength(2);

            // Set first player as active
            game = {
                ...game!,
                players: game!.players.map((p, i) => ({
                    ...p,
                    isActive: i === 0,
                })),
            };

            // Roll dice
            const playerId = game.players[0].id;
            game = gameReducer(game, {
                type: "ROLL_DICE",
                payload: { playerId },
            });

            expect(game?.diceRoll).toBeDefined();
            expect(game?.diceRoll).toBeGreaterThanOrEqual(1);
            expect(game?.diceRoll).toBeLessThanOrEqual(6);

            // Get valid cells
            const validCells = getValidCells(game!.diceRoll!, game!.board);
            expect(validCells.length).toBeGreaterThan(0);

            // Place piece
            const position = validCells[0];
            game = gameReducer(game, {
                type: "PLACE_PIECE",
                payload: {
                    position,
                    playerId,
                },
            });

            // Verify piece was placed
            const cell = game!.board.cells[position.row][position.col];
            expect(cell.stack.length).toBeGreaterThan(0);
            expect(cell.stack[cell.stack.length - 1].playerId).toBe(playerId);

            // Verify player's pieces remaining decreased
            const player = game!.players.find((p) => p.id === playerId);
            expect(player?.piecesRemaining).toBeLessThan(12);

            // PLACE_PIECE automatically moves to next player, so verify that
            const nextPlayer = game!.players.find((p) => p.isActive);
            expect(nextPlayer?.id).not.toBe(playerId);
        });

        it("should calculate and apply scores when placing pieces", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });

            const player = game!.players[0];
            game = {
                ...game!,
                players: game!.players.map((p) => ({
                    ...p,
                    isActive: p.id === player.id,
                })),
            };

            // Roll dice
            game = gameReducer(game, {
                type: "ROLL_DICE",
                payload: { playerId: player.id },
            });

            // Place piece to complete a row
            let previousBoard = createEmptyBoard();

            // Place pieces in first row (except last position)
            for (let col = 0; col < 4; col++) {
                const piece: Piece = {
                    id: `piece-${col}`,
                    playerId: player.id,
                    color: player.color,
                    placedAt: new Date(),
                    roundNumber: 1,
                };
                game = {
                    ...game!,
                    board: placePiece(game!.board, { row: 0, col }, piece),
                };
                previousBoard = placePiece(previousBoard, { row: 0, col }, piece);
            }

            // Place final piece to complete row
            const finalPiece: Piece = {
                id: "final-piece",
                playerId: player.id,
                color: player.color,
                placedAt: new Date(),
                roundNumber: 1,
            };
            const previousBoardBeforeFinal = { ...game!.board };
            game = {
                ...game!,
                board: placePiece(game!.board, { row: 0, col: 4 }, finalPiece),
            };

            // Calculate score for completing the row
            const finalScoreEvents = calculateScore(game.board, { row: 0, col: 4 }, player, previousBoardBeforeFinal);
            expect(finalScoreEvents.length).toBeGreaterThan(0);
            const rowCompletion = finalScoreEvents.find((e) => e.reason === "row_completion");
            expect(rowCompletion).toBeDefined();
            if (rowCompletion) {
                expect(rowCompletion.points).toBeGreaterThanOrEqual(3);
            }
        });

        it("should handle tall stack scoring integration", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });

            const player = game!.players[0];
            const position = { row: 2, col: 2 };

            // Build a tall stack
            let previousBoard = createEmptyBoard();
            for (let i = 0; i < 3; i++) {
                const piece: Piece = {
                    id: `piece-${i}`,
                    playerId: player.id,
                    color: player.color,
                    placedAt: new Date(),
                    roundNumber: 1,
                };
                game = {
                    ...game!,
                    board: placePiece(game!.board, position, piece),
                };
                previousBoard = placePiece(previousBoard, position, piece);
            }

            // Place 4th piece
            const fourthPiece: Piece = {
                id: "piece-3",
                playerId: player.id,
                color: player.color,
                placedAt: new Date(),
                roundNumber: 1,
            };
            game = {
                ...game!,
                board: placePiece(game!.board, position, fourthPiece),
            };

            // Calculate score
            const scoreEvents = calculateScore(game.board, position, player, previousBoard);
            const tallStackEvent = scoreEvents.find((e) => e.reason === "tall_stack");
            expect(tallStackEvent).toBeDefined();
            expect(tallStackEvent?.points).toBe(4);
        });
    });

    describe("Round Management Integration", () => {
        it("should handle round end and new round start", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });

            // Set game to roundEnd
            game = {
                ...game!,
                status: "roundEnd" as const,
            };

            // End round (should stay in roundEnd if no victory points)
            let endedGame = endRound(game);
            expect(endedGame.status).toBe("roundEnd");

            // Start new round
            const newRound = startNewRound(endedGame);
            expect(newRound.status).toBe("playing");
            expect(newRound.roundNumber).toBe(2);
            expect(newRound.players.every((p) => p.piecesRemaining === 12)).toBe(true);

            // Board should be reset
            const allEmpty = newRound.board.cells.every((row) => row.every((cell) => cell.stack.length === 0));
            expect(allEmpty).toBe(true);
        });

        it("should transition to gameEnd when victory points reached", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });

            // Set player to have victory points
            game = {
                ...game!,
                status: "roundEnd" as const,
                players: game!.players.map((p, i) => (i === 0 ? { ...p, score: 20 } : p)),
            };

            const endedGame = endRound(game);
            expect(endedGame.status).toBe("gameEnd");

            const shouldEnd = checkGameEnd(game);
            expect(shouldEnd).toBe(true);

            const winner = determineWinner(endedGame);
            expect(winner).not.toBeNull();
            expect(winner?.score).toBe(20);
        });
    });

    describe("2-Player Mode Integration", () => {
        it("should handle color selection and scoring in 2-player mode", () => {
            const twoPlayerConfig: GameConfig = {
                playerCount: 2,
                players: [
                    { name: "Alice", color: "pink", color2: "orange", order: 0 },
                    { name: "Bob", color: "yellow", color2: "purple", order: 1 },
                ],
                victoryPoints: 20,
            };

            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: twoPlayerConfig,
            });

            const player = game!.players[0];
            expect(player.color2).toBe("orange");
            expect(player.piecesRemainingByColor).toBeDefined();
            expect(player.piecesRemainingByColor?.pink).toBe(12);
            expect(player.piecesRemainingByColor?.orange).toBe(12);

            // Place piece with selected color
            game = {
                ...game!,
                players: game!.players.map((p) => ({
                    ...p,
                    isActive: p.id === player.id,
                })),
            };

            game = gameReducer(game, {
                type: "ROLL_DICE",
                payload: { playerId: player.id },
            });

            const position = { row: 2, col: 2 };
            // Need to roll dice first
            game = gameReducer(game, {
                type: "ROLL_DICE",
                payload: { playerId: player.id },
            });

            // Check if position is valid for dice roll
            const validCells = getValidCells(game!.diceRoll!, game!.board);
            const validPosition =
                validCells.find((p) => p.row === position.row && p.col === position.col) || validCells[0];

            game = gameReducer(game, {
                type: "PLACE_PIECE",
                payload: {
                    position: validPosition,
                    playerId: player.id,
                    color: "orange", // Selected color
                },
            });

            // Verify pieces remaining by color decreased
            const updatedPlayer = game!.players.find((p) => p.id === player.id);
            expect(updatedPlayer?.piecesRemainingByColor?.orange).toBe(11);
            expect(updatedPlayer?.piecesRemainingByColor?.pink).toBe(12);
        });

        it("should only score selected color in 2-player mode", () => {
            const twoPlayerConfig: GameConfig = {
                playerCount: 2,
                players: [
                    { name: "Alice", color: "pink", color2: "orange", order: 0 },
                    { name: "Bob", color: "yellow", color2: "purple", order: 1 },
                ],
                victoryPoints: 20,
            };

            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: twoPlayerConfig,
            });

            const player = game!.players[0];
            const position = { row: 2, col: 2 };

            // Build stack with mixed colors
            let previousBoard = createEmptyBoard();
            const pieces = [{ color: "pink" as const }, { color: "pink" as const }, { color: "orange" as const }];

            for (let i = 0; i < pieces.length; i++) {
                const piece: Piece = {
                    id: `piece-${i}`,
                    playerId: player.id,
                    color: pieces[i].color,
                    placedAt: new Date(),
                    roundNumber: 1,
                };
                game = {
                    ...game!,
                    board: placePiece(game!.board, position, piece),
                };
                previousBoard = placePiece(previousBoard, position, piece);
            }

            // Place 4th piece with orange color
            const fourthPiece: Piece = {
                id: "piece-3",
                playerId: player.id,
                color: "orange",
                placedAt: new Date(),
                roundNumber: 1,
            };
            game = {
                ...game!,
                board: placePiece(game!.board, position, fourthPiece),
            };

            // Calculate score with orange selected
            const scoreEvents = calculateScore(game.board, position, player, previousBoard, "orange");
            const tallStackEvent = scoreEvents.find((e) => e.reason === "tall_stack");
            expect(tallStackEvent).toBeDefined();
            // Should only count orange pieces (2: 1 original + 1 just placed)
            expect(tallStackEvent?.points).toBe(2);
        });
    });

    describe("Topple Integration", () => {
        it("should handle topple event and apply penalties/bonuses", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });

            const player1 = game!.players[0];
            const player2 = game!.players[1];

            // Set player 1 as active (current player index 0)
            game = {
                ...game!,
                currentPlayerIndex: 0,
                players: game!.players.map((p, i) => ({
                    ...p,
                    isActive: i === 0,
                })),
            };

            // Trigger topple (player1 causes topple, player2 is previous)
            game = gameReducer(game, {
                type: "TOGGLE_TOPPLE",
                payload: { playerId: player1.id },
            });

            expect(game?.toppleOccurred).toBe(true);
            expect(game?.topplePlayerId).toBe(player1.id);

            // Player 1 should have -10 points
            const topplePlayer = game!.players.find((p) => p.id === player1.id);
            expect(topplePlayer?.score).toBe(-10);

            // Player 2 should have +3 points (previous player)
            const previousPlayer = game!.players.find((p) => p.id === player2.id);
            expect(previousPlayer?.score).toBe(3);

            // Round should end
            expect(game?.status).toBe("roundEnd");
        });
    });

    describe("Scoring Integration with Game State", () => {
        it("should apply row completion scores to player", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });

            const player = game!.players[0];
            const position = { row: 0, col: 4 };

            // Build row (except last position)
            for (let col = 0; col < 4; col++) {
                const piece: Piece = {
                    id: `piece-${col}`,
                    playerId: player.id,
                    color: player.color,
                    placedAt: new Date(),
                    roundNumber: 1,
                };
                game = {
                    ...game!,
                    board: placePiece(game!.board, { row: 0, col }, piece),
                };
            }

            // Place final piece to complete row
            const finalPiece: Piece = {
                id: "final-piece",
                playerId: player.id,
                color: player.color,
                placedAt: new Date(),
                roundNumber: 1,
            };
            const previousBoard = { ...game!.board };
            game = {
                ...game!,
                board: placePiece(game!.board, position, finalPiece),
            };

            // Calculate and verify score
            const scoreEvents = calculateScore(game.board, position, player, previousBoard);
            const rowCompletion = scoreEvents.find((e) => e.reason === "row_completion");
            expect(rowCompletion).toBeDefined();
            expect(rowCompletion?.points).toBeGreaterThanOrEqual(3);
        });

        it("should handle multiple scoring events in one placement", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });

            const player = game!.players[0];
            const position = { row: 0, col: 0 };

            // Build tall stack at (0,0)
            let previousBoard = createEmptyBoard();
            for (let i = 0; i < 3; i++) {
                const piece: Piece = {
                    id: `stack-piece-${i}`,
                    playerId: player.id,
                    color: player.color,
                    placedAt: new Date(),
                    roundNumber: 1,
                };
                game = {
                    ...game!,
                    board: placePiece(game!.board, position, piece),
                };
                previousBoard = placePiece(previousBoard, position, piece);
            }

            // Place pieces in row (except position 0)
            for (let col = 1; col < 5; col++) {
                const piece: Piece = {
                    id: `row-piece-${col}`,
                    playerId: player.id,
                    color: player.color,
                    placedAt: new Date(),
                    roundNumber: 1,
                };
                game = {
                    ...game!,
                    board: placePiece(game!.board, { row: 0, col }, piece),
                };
                previousBoard = placePiece(previousBoard, { row: 0, col }, piece);
            }

            // Place 4th piece on stack (completes row and creates tall stack)
            const finalPiece: Piece = {
                id: "final-piece",
                playerId: player.id,
                color: player.color,
                placedAt: new Date(),
                roundNumber: 1,
            };
            game = {
                ...game!,
                board: placePiece(game!.board, position, finalPiece),
            };

            // Calculate score
            const scoreEvents = calculateScore(game.board, position, player, previousBoard);
            expect(scoreEvents.length).toBeGreaterThanOrEqual(1);

            // Should have tall stack event
            const tallStackEvent = scoreEvents.find((e) => e.reason === "tall_stack");
            expect(tallStackEvent).toBeDefined();
        });
    });

    describe("Game End Integration", () => {
        it("should determine winner correctly when game ends", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });

            // Set players with different scores
            game = {
                ...game!,
                status: "gameEnd" as const,
                players: game!.players.map((p, i) => ({
                    ...p,
                    score: i === 0 ? 25 : 15,
                })),
            };

            const winner = determineWinner(game);
            expect(winner).not.toBeNull();
            expect(winner?.id).toBe(game.players[0].id);
            expect(winner?.score).toBe(25);
        });

        it("should handle tie-breaker (highest score wins)", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: {
                    playerCount: 3,
                    players: [
                        { name: "Alice", color: "pink", order: 0 },
                        { name: "Bob", color: "yellow", order: 1 },
                        { name: "Charlie", color: "orange", order: 2 },
                    ],
                    victoryPoints: 20,
                },
            });

            // All players reached victory points
            const scores = [25, 30, 20];
            game = {
                ...game!,
                status: "gameEnd" as const,
                players: game!.players.map((p, i) => ({
                    ...p,
                    score: scores[i],
                })),
            };

            const winner = determineWinner(game);
            expect(winner).not.toBeNull();
            expect(winner?.score).toBe(30);
            expect(winner?.id).toBe(game.players[1].id);
        });
    });
});
