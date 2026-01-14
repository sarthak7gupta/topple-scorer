import { beforeEach, describe, expect, it } from "vitest";
import { gameReducer } from "../../../src/lib/game/gameState";
import { checkGameEnd, determineWinner, endRound, startNewRound } from "../../../src/lib/game/round";
import type { GameConfig } from "../../../src/lib/types/game";

describe("round.ts", () => {
    let gameConfig: GameConfig;

    beforeEach(() => {
        gameConfig = {
            playerCount: 2,
            players: [
                { name: "Player 1", color: "pink", order: 0 },
                { name: "Player 2", color: "yellow", order: 1 },
            ],
            victoryPoints: 20,
        };
    });

    describe("checkGameEnd", () => {
        it("should return false if game is not in roundEnd status", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });
            expect(checkGameEnd(game!)).toBe(false);
        });

        it("should return true if round ended and player reached victory points", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });
            // Set game to roundEnd and give player 1 victory points
            game = {
                ...game!,
                status: "roundEnd" as const,
                players: game!.players.map((p, i) => (i === 0 ? { ...p, score: 20 } : p)),
            };
            expect(checkGameEnd(game)).toBe(true);
        });

        it("should return false if round ended but no player reached victory points", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });
            game = {
                ...game!,
                status: "roundEnd" as const,
                players: game!.players.map((p, i) => (i === 0 ? { ...p, score: 15 } : p)),
            };
            expect(checkGameEnd(game)).toBe(false);
        });

        it("should return true if multiple players reached victory points", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });
            game = {
                ...game!,
                status: "roundEnd" as const,
                players: game!.players.map((p) => ({ ...p, score: 20 })),
            };
            expect(checkGameEnd(game)).toBe(true);
        });

        it("should return true if player exceeded victory points", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });
            game = {
                ...game!,
                status: "roundEnd" as const,
                players: game!.players.map((p, i) => (i === 0 ? { ...p, score: 25 } : p)),
            };
            expect(checkGameEnd(game)).toBe(true);
        });

        it("should return false for playing status even with victory points", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });
            game = {
                ...game!,
                status: "playing" as const,
                players: game!.players.map((p, i) => (i === 0 ? { ...p, score: 20 } : p)),
            };
            expect(checkGameEnd(game)).toBe(false);
        });
    });

    describe("determineWinner", () => {
        it("should return null if game is not ended", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });
            expect(determineWinner(game!)).toBeNull();
        });

        it("should return winner when game is ended", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });
            game = {
                ...game!,
                status: "gameEnd" as const,
                players: game!.players.map((p, i) => (i === 0 ? { ...p, score: 25 } : { ...p, score: 15 })),
            };
            const winner = determineWinner(game);
            expect(winner).not.toBeNull();
            expect(winner?.id).toBe(game.players[0].id);
            expect(winner?.score).toBe(25);
        });

        it("should return highest scorer if multiple players reached victory points at round end", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });
            game = {
                ...game!,
                status: "gameEnd" as const,
                players: game!.players.map((p, i) => (i === 0 ? { ...p, score: 25 } : { ...p, score: 30 })),
            };
            const winner = determineWinner(game);
            expect(winner).not.toBeNull();
            expect(winner?.score).toBe(30);
            expect(winner?.id).toBe(game.players[1].id);
        });

        it("should return first player if scores are tied", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });
            game = {
                ...game!,
                status: "gameEnd" as const,
                players: game!.players.map((p) => ({ ...p, score: 25 })),
            };
            const winner = determineWinner(game);
            expect(winner).not.toBeNull();
            expect(winner?.score).toBe(25);
            expect(winner?.id).toBe(game.players[0].id);
        });

        it("should handle 3-player game with winner", () => {
            gameConfig = {
                playerCount: 3,
                players: [
                    { name: "Player 1", color: "pink", order: 0 },
                    { name: "Player 2", color: "yellow", order: 1 },
                    { name: "Player 3", color: "orange", order: 2 },
                ],
                victoryPoints: 20,
            };
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });
            const scoreMap: { [key: number]: number } = { 0: 15, 1: 25, 2: 10 };
            game = {
                ...game!,
                status: "gameEnd" as const,
                players: game!.players.map((p, i) => ({
                    ...p,
                    score: scoreMap[i] ?? 10,
                })),
            };
            const winner = determineWinner(game);
            expect(winner).not.toBeNull();
            expect(winner?.id).toBe(game.players[1].id);
            expect(winner?.score).toBe(25);
        });

        it("should handle 4-player game with winner", () => {
            gameConfig = {
                playerCount: 4,
                players: [
                    { name: "Player 1", color: "pink", order: 0 },
                    { name: "Player 2", color: "yellow", order: 1 },
                    { name: "Player 3", color: "orange", order: 2 },
                    { name: "Player 4", color: "purple", order: 3 },
                ],
                victoryPoints: 20,
            };
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });
            const scoreMap: { [key: number]: number } = { 0: 15, 1: 20, 2: 25, 3: 30 };
            game = {
                ...game!,
                status: "gameEnd" as const,
                players: game!.players.map((p, i) => ({
                    ...p,
                    score: scoreMap[i] ?? 15,
                })),
            };
            const winner = determineWinner(game);
            expect(winner).not.toBeNull();
            expect(winner?.id).toBe(game.players[3].id);
            expect(winner?.score).toBe(30);
        });
    });

    describe("endRound", () => {
        it("should transition to gameEnd if victory points reached", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });
            game = {
                ...game!,
                status: "roundEnd" as const,
                players: game!.players.map((p, i) => (i === 0 ? { ...p, score: 20 } : p)),
            };
            const endedGame = endRound(game);
            expect(endedGame.status).toBe("gameEnd");
        });

        it("should stay in roundEnd if victory points not reached", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });
            game = {
                ...game!,
                status: "roundEnd" as const,
                players: game!.players.map((p, i) => (i === 0 ? { ...p, score: 15 } : p)),
            };
            const endedGame = endRound(game);
            expect(endedGame.status).toBe("roundEnd");
        });
    });

    describe("startNewRound", () => {
        it("should reset pieces remaining to 12 for all players", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });
            // Set players to have fewer pieces
            game = {
                ...game!,
                status: "roundEnd" as const,
                players: game!.players.map((p) => ({
                    ...p,
                    piecesRemaining: 5,
                })),
            };
            const newRound = startNewRound(game);
            expect(newRound.players.every((p) => p.piecesRemaining === 12)).toBe(true);
        });

        it("should increment round number", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });
            game = {
                ...game!,
                status: "roundEnd" as const,
                roundNumber: 1,
            };
            const newRound = startNewRound(game);
            expect(newRound.roundNumber).toBe(2);
        });

        it("should reset board", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });
            // Place some pieces
            game = {
                ...game!,
                status: "roundEnd" as const,
                board: {
                    ...game!.board,
                    cells: game!.board.cells.map((row, r) =>
                        row.map((cell, c) =>
                            r === 2 && c === 2
                                ? {
                                      ...cell,
                                      stack: [
                                          {
                                              id: "test",
                                              playerId: "player-1",
                                              color: "pink",
                                              placedAt: new Date(),
                                              roundNumber: 1,
                                          },
                                      ],
                                  }
                                : cell
                        )
                    ),
                },
            };
            const newRound = startNewRound(game);
            // All cells should be empty
            expect(newRound.board.cells.every((row) => row.every((cell) => cell.stack.length === 0))).toBe(true);
        });

        it("should reset topple flags", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });
            game = {
                ...game!,
                status: "roundEnd" as const,
                toppleOccurred: true,
                topplePlayerId: "player-1",
            };
            const newRound = startNewRound(game);
            expect(newRound.toppleOccurred).toBe(false);
            expect(newRound.topplePlayerId).toBeUndefined();
        });

        it("should reset piecesRemainingByColor for 2-player mode", () => {
            gameConfig = {
                playerCount: 2,
                players: [
                    {
                        name: "Player 1",
                        color: "pink",
                        color2: "orange",
                        order: 0,
                    },
                    {
                        name: "Player 2",
                        color: "yellow",
                        color2: "purple",
                        order: 1,
                    },
                ],
                victoryPoints: 20,
            };
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });
            // Set pieces remaining by color
            game = {
                ...game!,
                status: "roundEnd" as const,
                players: game!.players.map((p) => ({
                    ...p,
                    piecesRemainingByColor: {
                        pink: 5,
                        yellow: 0,
                        orange: 3,
                        purple: 0,
                    },
                })),
            };
            const newRound = startNewRound(game);
            expect(newRound.players[0].piecesRemainingByColor?.pink).toBe(12);
            expect(newRound.players[0].piecesRemainingByColor?.orange).toBe(12);
            expect(newRound.players[1].piecesRemainingByColor?.yellow).toBe(12);
            expect(newRound.players[1].piecesRemainingByColor?.purple).toBe(12);
        });

        it("should preserve scores between rounds", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });
            game = {
                ...game!,
                status: "roundEnd" as const,
                players: game!.players.map((p, i) => ({ ...p, score: i === 0 ? 15 : 10 })),
            };
            const newRound = startNewRound(game);
            // Scores should be preserved between rounds
            expect(newRound.players[0].score).toBe(15);
            expect(newRound.players[1].score).toBe(10);
        });

        it("should preserve victory points setting", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });
            game = {
                ...game!,
                status: "roundEnd" as const,
            };
            const newRound = startNewRound(game);
            expect(newRound.victoryPoints).toBe(gameConfig.victoryPoints);
        });

        it("should preserve player configuration", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });
            game = {
                ...game!,
                status: "roundEnd" as const,
            };
            const newRound = startNewRound(game);
            expect(newRound.players).toHaveLength(gameConfig.players.length);
            newRound.players.forEach((player, index) => {
                expect(player.name).toBe(gameConfig.players[index].name);
                expect(player.color).toBe(gameConfig.players[index].color);
                expect(player.order).toBe(gameConfig.players[index].order);
            });
        });

        it("should handle multiple rounds", () => {
            let game = gameReducer(null, {
                type: "SETUP_GAME",
                payload: gameConfig,
            });
            game = {
                ...game!,
                status: "roundEnd" as const,
                roundNumber: 1,
            };
            let newRound = startNewRound(game);
            expect(newRound.roundNumber).toBe(2);
            newRound = {
                ...newRound,
                status: "roundEnd" as const,
            };
            newRound = startNewRound(newRound);
            expect(newRound.roundNumber).toBe(3);
        });
    });
});
