import { describe, expect, it } from "vitest";
import type { Piece } from "../../src/lib/types/game";
import type { Player } from "../../src/lib/types/player";
import { canPlacePiece, createEmptyBoard, getValidCells, placePiece } from "../../src/lib/game/board";
import { calculateScore, checkRowCompletion } from "../../src/lib/game/scoring";

describe("Board and Scoring Integration", () => {
    describe("Row Completion with Board Operations", () => {
        it("should detect row completion after placing pieces", () => {
            const board = createEmptyBoard();
            const player: Player = {
                id: "player-1",
                name: "Test Player",
                color: "pink",
                score: 0,
                piecesRemaining: 12,
                totalPieces: 12,
                order: 0,
                isActive: true,
            };

            // Place pieces in first row
            let currentBoard = board;
            for (let col = 0; col < 5; col++) {
                const piece: Piece = {
                    id: `piece-${col}`,
                    playerId: player.id,
                    color: player.color,
                    placedAt: new Date(),
                    roundNumber: 1,
                };
                currentBoard = placePiece(currentBoard, { row: 0, col }, piece);
            }

            // Check row completion
            const result = checkRowCompletion(currentBoard, { row: 0, col: 0 });
            expect(result.completed).toBe(true);
            expect(result.direction).toBe("horizontal");
        });

        it("should calculate score for completed row", () => {
            let board = createEmptyBoard();
            let previousBoard = createEmptyBoard();
            const player: Player = {
                id: "player-1",
                name: "Test Player",
                color: "pink",
                score: 0,
                piecesRemaining: 12,
                totalPieces: 12,
                order: 0,
                isActive: true,
            };

            // Place pieces in first row (except last)
            for (let col = 0; col < 4; col++) {
                const piece: Piece = {
                    id: `piece-${col}`,
                    playerId: player.id,
                    color: player.color,
                    placedAt: new Date(),
                    roundNumber: 1,
                };
                board = placePiece(board, { row: 0, col }, piece);
                previousBoard = placePiece(previousBoard, { row: 0, col }, piece);
            }

            // Place final piece
            const finalPiece: Piece = {
                id: "final-piece",
                playerId: player.id,
                color: player.color,
                placedAt: new Date(),
                roundNumber: 1,
            };
            board = placePiece(board, { row: 0, col: 4 }, finalPiece);

            // Calculate score
            const scoreEvents = calculateScore(board, { row: 0, col: 4 }, player, previousBoard);
            const rowCompletion = scoreEvents.find((e) => e.reason === "row_completion");
            expect(rowCompletion).toBeDefined();
            expect(rowCompletion?.points).toBeGreaterThanOrEqual(3);
        });

        it("should handle vertical row completion", () => {
            const board = createEmptyBoard();
            const player: Player = {
                id: "player-1",
                name: "Test Player",
                color: "pink",
                score: 0,
                piecesRemaining: 12,
                totalPieces: 12,
                order: 0,
                isActive: true,
            };

            // Place pieces in first column
            let currentBoard = board;
            for (let row = 0; row < 5; row++) {
                const piece: Piece = {
                    id: `piece-${row}`,
                    playerId: player.id,
                    color: player.color,
                    placedAt: new Date(),
                    roundNumber: 1,
                };
                currentBoard = placePiece(currentBoard, { row, col: 0 }, piece);
            }

            const result = checkRowCompletion(currentBoard, { row: 0, col: 0 });
            expect(result.completed).toBe(true);
            expect(result.direction).toBe("vertical");
        });

        it("should handle diagonal row completion", () => {
            const board = createEmptyBoard();
            const player: Player = {
                id: "player-1",
                name: "Test Player",
                color: "pink",
                score: 0,
                piecesRemaining: 12,
                totalPieces: 12,
                order: 0,
                isActive: true,
            };

            // Place pieces on diagonal
            let currentBoard = board;
            for (let i = 0; i < 5; i++) {
                const piece: Piece = {
                    id: `piece-${i}`,
                    playerId: player.id,
                    color: player.color,
                    placedAt: new Date(),
                    roundNumber: 1,
                };
                currentBoard = placePiece(currentBoard, { row: i, col: i }, piece);
            }

            const result = checkRowCompletion(currentBoard, { row: 2, col: 2 });
            expect(result.completed).toBe(true);
            expect(result.direction).toBe("diagonal");
        });
    });

    describe("Tall Stack with Board Operations", () => {
        it("should calculate tall stack score after building stack", () => {
            let board = createEmptyBoard();
            let previousBoard = createEmptyBoard();
            const player: Player = {
                id: "player-1",
                name: "Test Player",
                color: "pink",
                score: 0,
                piecesRemaining: 12,
                totalPieces: 12,
                order: 0,
                isActive: true,
            };

            const position = { row: 2, col: 2 };

            // Build stack of 3
            for (let i = 0; i < 3; i++) {
                const piece: Piece = {
                    id: `piece-${i}`,
                    playerId: player.id,
                    color: player.color,
                    placedAt: new Date(),
                    roundNumber: 1,
                };
                board = placePiece(board, position, piece);
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
            board = placePiece(board, position, fourthPiece);

            // Verify stack has 4 pieces
            expect(board.cells[position.row][position.col].stack.length).toBe(4);

            // Calculate score
            const scoreEvents = calculateScore(board, position, player, previousBoard);
            const tallStackEvent = scoreEvents.find((e) => e.reason === "tall_stack");
            expect(tallStackEvent).toBeDefined();
            expect(tallStackEvent?.points).toBe(4);
        });

        it("should handle mixed player pieces in tall stack", () => {
            let board = createEmptyBoard();
            let previousBoard = createEmptyBoard();
            const player1: Player = {
                id: "player-1",
                name: "Player 1",
                color: "pink",
                score: 0,
                piecesRemaining: 12,
                totalPieces: 12,
                order: 0,
                isActive: true,
            };
            const player2: Player = {
                id: "player-2",
                name: "Player 2",
                color: "yellow",
                score: 0,
                piecesRemaining: 12,
                totalPieces: 12,
                order: 1,
                isActive: false,
            };

            const position = { row: 2, col: 2 };

            // Build mixed stack: player1, player1, player2, player2
            const pieces = [
                { player: player1, color: "pink" as const },
                { player: player1, color: "pink" as const },
                { player: player2, color: "yellow" as const },
                { player: player2, color: "yellow" as const },
            ];

            for (let i = 0; i < pieces.length; i++) {
                const piece: Piece = {
                    id: `piece-${i}`,
                    playerId: pieces[i].player.id,
                    color: pieces[i].color,
                    placedAt: new Date(),
                    roundNumber: 1,
                };
                board = placePiece(board, position, piece);
                previousBoard = placePiece(previousBoard, position, piece);
            }

            // Place 5th piece from player1
            const fifthPiece: Piece = {
                id: "piece-4",
                playerId: player1.id,
                color: player1.color,
                placedAt: new Date(),
                roundNumber: 1,
            };
            board = placePiece(board, position, fifthPiece);

            // Calculate score for player1
            const scoreEvents = calculateScore(board, position, player1, previousBoard);
            const tallStackEvent = scoreEvents.find((e) => e.reason === "tall_stack");
            expect(tallStackEvent).toBeDefined();
            // Should only count player1's pieces (3: 2 original + 1 just placed)
            expect(tallStackEvent?.points).toBe(3);
        });
    });

    describe("Dice Roll and Placement Integration", () => {
        it("should only allow placement on valid cells based on dice roll", () => {
            const board = createEmptyBoard();

            // Dice roll 1 - only center
            const validCells1 = getValidCells(1, board);
            expect(validCells1).toHaveLength(1);
            expect(validCells1[0]).toEqual({ row: 2, col: 2 });

            const canPlaceCenter = canPlacePiece({ row: 2, col: 2 }, 1, board);
            expect(canPlaceCenter).toBe(true);

            const cannotPlaceCorner = canPlacePiece({ row: 0, col: 0 }, 1, board);
            expect(cannotPlaceCorner).toBe(false);

            // Dice roll 6 - anywhere
            const validCells6 = getValidCells(6, board);
            expect(validCells6).toHaveLength(25);

            const canPlaceAnywhere = canPlacePiece({ row: 0, col: 0 }, 6, board);
            expect(canPlaceAnywhere).toBe(true);
        });

        it("should place pieces and calculate scores correctly", () => {
            let board = createEmptyBoard();
            let previousBoard = createEmptyBoard();
            const player: Player = {
                id: "player-1",
                name: "Test Player",
                color: "pink",
                score: 0,
                piecesRemaining: 12,
                totalPieces: 12,
                order: 0,
                isActive: true,
            };

            // Roll dice 1 - can only place at center
            const validCells = getValidCells(1, board);
            expect(validCells).toHaveLength(1);
            const position = validCells[0];

            const piece: Piece = {
                id: "piece-1",
                playerId: player.id,
                color: player.color,
                placedAt: new Date(),
                roundNumber: 1,
            };

            board = placePiece(board, position, piece);

            // Verify piece was placed
            expect(board.cells[position.row][position.col].stack.length).toBe(1);
            expect(board.cells[position.row][position.col].stack[0].playerId).toBe(player.id);

            // Calculate score (should be 0 for single piece)
            const scoreEvents = calculateScore(board, position, player, previousBoard);
            expect(scoreEvents.length).toBe(0);
        });
    });

    describe("Completed Row Bonus Integration", () => {
        it("should give bonus for adding to completed row", () => {
            let board = createEmptyBoard();
            let previousBoard = createEmptyBoard();
            const player: Player = {
                id: "player-1",
                name: "Test Player",
                color: "pink",
                score: 0,
                piecesRemaining: 12,
                totalPieces: 12,
                order: 0,
                isActive: true,
            };

            // Complete the row
            for (let col = 0; col < 5; col++) {
                const piece: Piece = {
                    id: `piece-${col}`,
                    playerId: player.id,
                    color: player.color,
                    placedAt: new Date(),
                    roundNumber: 1,
                };
                board = placePiece(board, { row: 0, col }, piece);
                previousBoard = placePiece(previousBoard, { row: 0, col }, piece);
            }

            // Add another piece to completed row
            const extraPiece: Piece = {
                id: "extra-piece",
                playerId: player.id,
                color: player.color,
                placedAt: new Date(),
                roundNumber: 1,
            };
            board = placePiece(board, { row: 0, col: 0 }, extraPiece);

            // Calculate score
            const scoreEvents = calculateScore(board, { row: 0, col: 0 }, player, previousBoard);
            const bonusEvent = scoreEvents.find((e) => e.reason === "completed_row_bonus");
            expect(bonusEvent).toBeDefined();
            expect(bonusEvent?.points).toBeGreaterThan(0);
        });
    });
});
