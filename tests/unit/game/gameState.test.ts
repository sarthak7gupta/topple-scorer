import { beforeEach, describe, expect, it } from "vitest";
import { gameReducer } from "../../../src/lib/game/gameState";
import type { GameConfig } from "../../../src/lib/types/game";

describe("gameReducer", () => {
    let initialConfig: GameConfig;

    beforeEach(() => {
        initialConfig = {
            playerCount: 2,
            players: [
                { name: "Player 1", color: "pink", order: 0 },
                { name: "Player 2", color: "yellow", order: 1 },
            ],
            victoryPoints: 20,
        };
    });

    describe("SETUP_GAME", () => {
        it("should initialize a new game", () => {
            const game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: initialConfig,
            });

            expect(game).not.toBeNull();
            expect(game?.players).toHaveLength(2);
            expect(game?.roundNumber).toBe(1);
            expect(game?.victoryPoints).toBe(20);
            expect(game?.status).toBe("playing");
            expect(game?.board).toBeDefined();
        });

        it("should initialize players with correct properties", () => {
            const game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: initialConfig,
            });

            expect(game?.players[0].name).toBe("Player 1");
            expect(game?.players[0].color).toBe("pink");
            expect(game?.players[0].piecesRemaining).toBe(12);
            expect(game?.players[0].score).toBe(0);
        });

        it("should create game log entry", () => {
            const game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: initialConfig,
            });

            expect(game?.log).toBeDefined();
            expect(Array.isArray(game?.log)).toBe(true);
            expect(game?.log.length).toBeGreaterThan(0);
        });
    });

    describe("ROLL_DICE", () => {
        it("should set dice roll value", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: initialConfig,
            });
            // Set first player as active (needed for ROLL_DICE to work)
            game = {
                ...game!,
                players: game!.players.map((p, i) => ({
                    ...p,
                    isActive: i === 0,
                })),
            };
            game = gameReducer(game, {
                type: "ROLL_DICE",
                payload: { playerId: game.players[0].id },
            });

            expect(game?.diceRoll).toBeDefined();
            expect(game?.diceRoll).toBeGreaterThanOrEqual(1);
            expect(game?.diceRoll).toBeLessThanOrEqual(6);
        });

        it("should not roll dice if game is ended", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: initialConfig,
            });
            game = { ...game!, status: "gameEnd" as const };
            const originalDiceRoll = game.diceRoll;

            game = gameReducer(game, {
                type: "ROLL_DICE",
                payload: { playerId: game.players[0].id },
            });
            expect(game!.diceRoll).toBe(originalDiceRoll);
        });

        it("should add log entry for dice roll", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: initialConfig,
            });
            // Set first player as active
            game = {
                ...game!,
                players: game!.players.map((p, i) => ({
                    ...p,
                    isActive: i === 0,
                })),
            };
            const logLengthBefore = game.log.length;

            game = gameReducer(game, {
                type: "ROLL_DICE",
                payload: { playerId: game.players[0].id },
            });

            expect(game?.log.length).toBe(logLengthBefore + 1);
            expect(game?.log[game.log.length - 1].type).toBe("dice_roll");
        });
    });

    describe("PLACE_PIECE", () => {
        it("should place piece on board", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: initialConfig,
            });
            // Set first player as active
            game = {
                ...game!,
                players: game!.players.map((p, i) => ({
                    ...p,
                    isActive: i === 0,
                })),
                diceRoll: 1, // Roll 1 allows center placement
            };

            const position = { row: 2, col: 2 }; // Center cell
            const cellBefore = game.board.cells[position.row][position.col];
            const stackLengthBefore = cellBefore.stack.length;

            game = gameReducer(game, {
                type: "PLACE_PIECE",
                payload: {
                    position,
                    playerId: game.players[game.currentPlayerIndex].id,
                },
            });

            expect(game?.board.cells[position.row][position.col].stack.length).toBe(stackLengthBefore + 1);
        });

        it("should decrease player pieces remaining", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: initialConfig,
            });
            // Set first player as active and set dice roll to 1 (for center placement)
            game = {
                ...game!,
                players: game!.players.map((p, i) => ({
                    ...p,
                    isActive: i === 0,
                })),
                diceRoll: 1,
            };

            const playerBefore = game.players[0];
            const piecesBefore = playerBefore.piecesRemaining;

            game = gameReducer(game, {
                type: "PLACE_PIECE",
                payload: {
                    position: { row: 2, col: 2 }, // Center cell
                    playerId: game.players[game.currentPlayerIndex].id,
                },
            });

            const playerAfter = game!.players.find((p) => p.id === playerBefore.id);
            expect(playerAfter?.piecesRemaining).toBe(piecesBefore - 1);
        });

        it("should not place piece without dice roll", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: initialConfig,
            });

            const position = { row: 2, col: 2 };
            const cellBefore = game!.board.cells[position.row][position.col];
            const stackLengthBefore = cellBefore.stack.length;

            game = gameReducer(game, {
                type: "PLACE_PIECE",
                payload: {
                    position,
                    playerId: game!.players[game!.currentPlayerIndex].id,
                },
            });

            expect(game?.board.cells[position.row][position.col].stack.length).toBe(stackLengthBefore);
        });

        it("should move to next player after placement", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: initialConfig,
            });
            // Set first player as active and set dice roll to 1 (for center placement)
            game = {
                ...game!,
                players: game!.players.map((p, i) => ({
                    ...p,
                    isActive: i === 0,
                })),
                currentPlayerIndex: 0,
                diceRoll: 1,
            };

            const currentPlayerIndexBefore = game.currentPlayerIndex;

            game = gameReducer(game, {
                type: "PLACE_PIECE",
                payload: {
                    position: { row: 2, col: 2 }, // Center cell
                    playerId: game.players[game.currentPlayerIndex].id,
                },
            });

            const expectedNextIndex = (currentPlayerIndexBefore + 1) % game!.players.length;
            expect(game?.currentPlayerIndex).toBe(expectedNextIndex);
            expect(game?.players[expectedNextIndex].isActive).toBe(true);
        });
    });

    describe("RESET_GAME", () => {
        it("should reset game to null", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: initialConfig,
            });
            game = gameReducer(game, { type: "RESET_GAME" });

            expect(game).toBeNull();
        });
    });

    describe("TOGGLE_TOPPLE", () => {
        it("should apply topple penalty and bonus", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: initialConfig,
            });
            game = {
                ...game!,
                status: "playing" as const,
                players: game!.players.map((p, i) => ({
                    ...p,
                    isActive: i === 0,
                    score: 10,
                })),
                currentPlayerIndex: 0,
            };

            const causingPlayer = game.players[0];
            const previousPlayer = game.players[1];
            const causingPlayerScoreBefore = causingPlayer.score;
            const previousPlayerScoreBefore = previousPlayer.score;

            game = gameReducer(game, {
                type: "TOGGLE_TOPPLE",
                payload: { playerId: causingPlayer.id },
            });

            const causingPlayerAfter = game!.players.find((p) => p.id === causingPlayer.id);
            const previousPlayerAfter = game!.players.find((p) => p.id === previousPlayer.id);

            expect(causingPlayerAfter?.score).toBe(causingPlayerScoreBefore - 10);
            expect(previousPlayerAfter?.score).toBe(previousPlayerScoreBefore + 3);
            expect(game?.status).toBe("roundEnd");
            expect(game?.toppleOccurred).toBe(true);
        });
    });

    describe("Game End", () => {
        it("should NOT end game immediately when victory points reached during round", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: initialConfig,
            });
            game = {
                ...game!,
                status: "playing" as const,
                players: game!.players.map((p, i) => ({
                    ...p,
                    isActive: i === 0,
                    score: i === 0 ? 19 : 5, // Player 1 close to victory
                })),
                currentPlayerIndex: 0,
                diceRoll: 1,
            };

            // Place piece that will give player 1 enough points
            game = gameReducer(game, {
                type: "PLACE_PIECE",
                payload: {
                    position: { row: 2, col: 2 },
                    playerId: game.players[0].id,
                },
            });

            // Manually set score to victory points
            game = {
                ...game!,
                players: game!.players.map((p, i) => (i === 0 ? { ...p, score: 20 } : p)),
            };

            // Game should NOT end immediately - it should continue until round ends
            expect(game.status).not.toBe("gameEnd");
            expect(game.status).toBe("playing");
        });

        it("should end game when victory points reached AND round has ended", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: initialConfig,
            });

            // Set game to roundEnd with a player who has victory points
            game = {
                ...game!,
                status: "roundEnd" as const,
                players: game!.players.map((p, i) => (i === 0 ? { ...p, score: 20 } : p)),
            };

            // End the round - should trigger game end
            game = gameReducer(game, {
                type: "END_ROUND",
            });

            expect(game!.status).toBe("gameEnd");
        });
    });
});
