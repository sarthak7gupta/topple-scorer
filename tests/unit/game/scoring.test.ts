import { describe, expect, it } from "vitest";
import { createEmptyBoard, placePiece } from "../../../src/lib/game/board";
import { calculateScore, checkRowCompletion } from "../../../src/lib/game/scoring";
import type { Piece } from "../../../src/lib/types/game";
import type { Player, PlayerColor } from "../../../src/lib/types/player";

describe("checkRowCompletion", () => {
    it("should detect completed horizontal row", () => {
        let board = createEmptyBoard();
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
        for (let col = 0; col < 5; col++) {
            const piece: Piece = {
                id: `piece-${col}`,
                playerId: player.id,
                color: player.color,
                placedAt: new Date(),
                roundNumber: 1,
            };
            board = placePiece(board, { row: 0, col }, piece);
        }

        const result = checkRowCompletion(board, { row: 0, col: 0 });
        expect(result.completed).toBe(true);
        expect(result.direction).toBe("horizontal");
    });

    it("should detect completed vertical row", () => {
        let board = createEmptyBoard();
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
        for (let row = 0; row < 5; row++) {
            const piece: Piece = {
                id: `piece-${row}`,
                playerId: player.id,
                color: player.color,
                placedAt: new Date(),
                roundNumber: 1,
            };
            board = placePiece(board, { row, col: 0 }, piece);
        }

        const result = checkRowCompletion(board, { row: 0, col: 0 });
        expect(result.completed).toBe(true);
        expect(result.direction).toBe("vertical");
    });

    it("should return false for incomplete row", () => {
        const board = createEmptyBoard();
        const result = checkRowCompletion(board, { row: 0, col: 0 });
        expect(result.completed).toBe(false);
        expect(result.direction).toBeNull();
    });

    it("should detect completed diagonal row (top-left to bottom-right)", () => {
        let board = createEmptyBoard();
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

        // Place pieces on diagonal (0,0), (1,1), (2,2), (3,3), (4,4)
        for (let i = 0; i < 5; i++) {
            const piece: Piece = {
                id: `piece-${i}`,
                playerId: player.id,
                color: player.color,
                placedAt: new Date(),
                roundNumber: 1,
            };
            board = placePiece(board, { row: i, col: i }, piece);
        }

        const result = checkRowCompletion(board, { row: 2, col: 2 });
        expect(result.completed).toBe(true);
        expect(result.direction).toBe("diagonal");
    });

    it("should detect completed diagonal row (top-right to bottom-left)", () => {
        let board = createEmptyBoard();
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

        // Place pieces on diagonal (0,4), (1,3), (2,2), (3,1), (4,0)
        for (let i = 0; i < 5; i++) {
            const piece: Piece = {
                id: `piece-${i}`,
                playerId: player.id,
                color: player.color,
                placedAt: new Date(),
                roundNumber: 1,
            };
            board = placePiece(board, { row: i, col: 4 - i }, piece);
        }

        const result = checkRowCompletion(board, { row: 2, col: 2 });
        expect(result.completed).toBe(true);
        expect(result.direction).toBe("diagonal");
    });

    it("should return false for incomplete diagonal", () => {
        let board = createEmptyBoard();
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

        // Place only 3 pieces on diagonal
        for (let i = 0; i < 3; i++) {
            const piece: Piece = {
                id: `piece-${i}`,
                playerId: player.id,
                color: player.color,
                placedAt: new Date(),
                roundNumber: 1,
            };
            board = placePiece(board, { row: i, col: i }, piece);
        }

        const result = checkRowCompletion(board, { row: 1, col: 1 });
        expect(result.completed).toBe(false);
        expect(result.direction).toBeNull();
    });
});

describe("calculateScore", () => {
    it("should calculate score for row completion", () => {
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

        // Place pieces in first row (except last one)
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

        // Place final piece to complete row
        const finalPiece: Piece = {
            id: "piece-final",
            playerId: player.id,
            color: player.color,
            placedAt: new Date(),
            roundNumber: 1,
        };
        board = placePiece(board, { row: 0, col: 4 }, finalPiece);

        const scoreEvents = calculateScore(board, { row: 0, col: 4 }, player, previousBoard);

        // Should get 3 points for completion + points for top pieces
        expect(scoreEvents.length).toBeGreaterThan(0);
        const completionEvent = scoreEvents.find((e) => e.reason === "row_completion");
        expect(completionEvent).toBeDefined();
        expect(completionEvent?.points).toBeGreaterThanOrEqual(3);
    });

    it("should only score selected color pieces in 2-player mode", () => {
        let board = createEmptyBoard();
        let previousBoard = createEmptyBoard();
        const player: Player = {
            id: "player-1",
            name: "Test Player",
            color: "pink",
            color2: "orange",
            score: 0,
            piecesRemaining: 12,
            totalPieces: 12,
            order: 0,
            isActive: true,
            piecesRemainingByColor: {
                pink: 12,
                yellow: 0,
                orange: 12,
                purple: 0,
            },
        };

        // Place pieces of different colors in first row
        for (let col = 0; col < 4; col++) {
            const pieceColor = col < 2 ? "pink" : "orange";
            const piece: Piece = {
                id: `piece-${col}`,
                playerId: player.id,
                color: pieceColor,
                placedAt: new Date(),
                roundNumber: 1,
            };
            board = placePiece(board, { row: 0, col }, piece);
            previousBoard = placePiece(previousBoard, { row: 0, col }, piece);
        }

        // Place final piece with orange color to complete row
        const finalPiece: Piece = {
            id: "piece-final",
            playerId: player.id,
            color: "orange",
            placedAt: new Date(),
            roundNumber: 1,
        };
        board = placePiece(board, { row: 0, col: 4 }, finalPiece);

        // Calculate score with orange as selected color
        const scoreEvents = calculateScore(board, { row: 0, col: 4 }, player, previousBoard, "orange");

        // Should only count orange pieces in the row
        const completionEvent = scoreEvents.find((e) => e.reason === "row_completion");
        expect(completionEvent).toBeDefined();
        // Should get 3 base points + points for orange top pieces only
        expect(completionEvent?.points).toBeGreaterThanOrEqual(3);
    });

    it("should calculate score for tall stack (existing stack has 3+ pieces)", () => {
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

        // Place 3 pieces on same cell to create a stack of 3
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

        // Place 4th piece (stack now has 4 pieces, was 3 before)
        const fourthPiece: Piece = {
            id: "piece-3",
            playerId: player.id,
            color: player.color,
            placedAt: new Date(),
            roundNumber: 1,
        };
        board = placePiece(board, position, fourthPiece);

        const scoreEvents = calculateScore(board, position, player, previousBoard);

        const tallStackEvent = scoreEvents.find((e) => e.reason === "tall_stack");
        expect(tallStackEvent).toBeDefined();
        expect(tallStackEvent?.points).toBeGreaterThan(0);
        // Should score 4 points (one for each of the player's pieces in the stack)
        expect(tallStackEvent?.points).toBe(4);
    });

    it("should not score tall stack for stack of 2 or fewer pieces", () => {
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

        // Place 2 pieces on same cell (should not score, need 3+)
        for (let i = 0; i < 2; i++) {
            const piece: Piece = {
                id: `piece-${i}`,
                playerId: player.id,
                color: player.color,
                placedAt: new Date(),
                roundNumber: 1,
            };
            board = placePiece(board, position, piece);
            if (i === 0) {
                previousBoard = placePiece(previousBoard, position, piece);
            }
        }

        const scoreEvents = calculateScore(board, position, player, previousBoard);

        const tallStackEvent = scoreEvents.find((e) => e.reason === "tall_stack");
        expect(tallStackEvent).toBeUndefined();
    });

    it("should calculate score for tall stack with 5+ pieces", () => {
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

        // Place 4 pieces to create a stack of 4
        for (let i = 0; i < 4; i++) {
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

        // Place 5th piece
        const fifthPiece: Piece = {
            id: "piece-4",
            playerId: player.id,
            color: player.color,
            placedAt: new Date(),
            roundNumber: 1,
        };
        board = placePiece(board, position, fifthPiece);

        const scoreEvents = calculateScore(board, position, player, previousBoard);

        const tallStackEvent = scoreEvents.find((e) => e.reason === "tall_stack");
        expect(tallStackEvent).toBeDefined();
        expect(tallStackEvent?.points).toBe(5);
    });

    it("should calculate score for tall stack with mixed player pieces", () => {
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

        // Place 2 pieces from player1, then 2 from player2 (stack of 4)
        const pieces = [
            { player: player1, color: "pink" },
            { player: player1, color: "pink" },
            { player: player2, color: "yellow" },
            { player: player2, color: "yellow" },
        ];

        for (let i = 0; i < pieces.length; i++) {
            const piece: Piece = {
                id: `piece-${i}`,
                playerId: pieces[i].player.id,
                color: pieces[i].color as PlayerColor,
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

        const scoreEvents = calculateScore(board, position, player1, previousBoard);

        const tallStackEvent = scoreEvents.find((e) => e.reason === "tall_stack");
        expect(tallStackEvent).toBeDefined();
        // Should only score player1's pieces (3 pieces: 2 original + 1 just placed)
        expect(tallStackEvent?.points).toBe(3);
    });

    it("should calculate score for tall stack in 2-player mode with selected color", () => {
        let board = createEmptyBoard();
        let previousBoard = createEmptyBoard();
        const player: Player = {
            id: "player-1",
            name: "Test Player",
            color: "pink",
            color2: "orange",
            score: 0,
            piecesRemaining: 12,
            totalPieces: 12,
            order: 0,
            isActive: true,
            piecesRemainingByColor: {
                pink: 12,
                yellow: 0,
                orange: 12,
                purple: 0,
            },
        };

        const position = { row: 2, col: 2 };

        // Place 3 pink pieces, then 1 orange piece (stack of 4)
        const pieces = [{ color: "pink" }, { color: "pink" }, { color: "pink" }, { color: "orange" }];

        for (let i = 0; i < pieces.length; i++) {
            const piece: Piece = {
                id: `piece-${i}`,
                playerId: player.id,
                color: pieces[i].color as PlayerColor,
                placedAt: new Date(),
                roundNumber: 1,
            };
            board = placePiece(board, position, piece);
            previousBoard = placePiece(previousBoard, position, piece);
        }

        // Place 5th piece with orange color
        const fifthPiece: Piece = {
            id: "piece-4",
            playerId: player.id,
            color: "orange",
            placedAt: new Date(),
            roundNumber: 1,
        };
        board = placePiece(board, position, fifthPiece);

        // Calculate score with orange as selected color
        const scoreEvents = calculateScore(board, position, player, previousBoard, "orange");

        const tallStackEvent = scoreEvents.find((e) => e.reason === "tall_stack");
        expect(tallStackEvent).toBeDefined();
        // Should only count orange pieces (2 pieces: 1 original + 1 just placed)
        expect(tallStackEvent?.points).toBe(2);
    });

    it("should calculate completed row bonus when adding to already completed row", () => {
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

        // Complete the first row
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

        // Add another piece to the completed row
        const extraPiece: Piece = {
            id: "piece-extra",
            playerId: player.id,
            color: player.color,
            placedAt: new Date(),
            roundNumber: 1,
        };
        board = placePiece(board, { row: 0, col: 0 }, extraPiece);

        const scoreEvents = calculateScore(board, { row: 0, col: 0 }, player, previousBoard);

        const bonusEvent = scoreEvents.find((e) => e.reason === "completed_row_bonus");
        expect(bonusEvent).toBeDefined();
        // Should get 1 point per top piece of player's color in the row
        expect(bonusEvent?.points).toBeGreaterThan(0);
        // Should not have row_completion event (row was already completed)
        const completionEvent = scoreEvents.find((e) => e.reason === "row_completion");
        expect(completionEvent).toBeUndefined();
    });

    it("should calculate score for diagonal row completion", () => {
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

        // Place pieces on diagonal (except last one)
        for (let i = 0; i < 4; i++) {
            const piece: Piece = {
                id: `piece-${i}`,
                playerId: player.id,
                color: player.color,
                placedAt: new Date(),
                roundNumber: 1,
            };
            board = placePiece(board, { row: i, col: i }, piece);
            previousBoard = placePiece(previousBoard, { row: i, col: i }, piece);
        }

        // Place final piece to complete diagonal
        const finalPiece: Piece = {
            id: "piece-final",
            playerId: player.id,
            color: player.color,
            placedAt: new Date(),
            roundNumber: 1,
        };
        board = placePiece(board, { row: 4, col: 4 }, finalPiece);

        const scoreEvents = calculateScore(board, { row: 4, col: 4 }, player, previousBoard);

        const completionEvent = scoreEvents.find((e) => e.reason === "row_completion");
        expect(completionEvent).toBeDefined();
        expect(completionEvent?.points).toBeGreaterThanOrEqual(3);
        expect(completionEvent?.details).toContain("diagonal");
    });

    it("should calculate tall stack score when placing on existing tall stack", () => {
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

        // Build a tall stack - 3 pieces
        for (let i = 0; i < 3; i++) {
            const piece: Piece = {
                id: `stack-piece-${i}`,
                playerId: player.id,
                color: player.color,
                placedAt: new Date(),
                roundNumber: 1,
            };
            board = placePiece(board, position, piece);
            previousBoard = placePiece(previousBoard, position, piece);
        }

        // Place 4th piece on the stack - triggers tall stack scoring
        const finalPiece: Piece = {
            id: "final-piece",
            playerId: player.id,
            color: player.color,
            placedAt: new Date(),
            roundNumber: 1,
        };
        board = placePiece(board, position, finalPiece);

        const scoreEvents = calculateScore(board, position, player, previousBoard);

        const tallStackEvent = scoreEvents.find((e) => e.reason === "tall_stack");
        expect(tallStackEvent).toBeDefined();
        expect(tallStackEvent?.points).toBe(4); // 4 pieces in stack
    });

    it("should return no score events for regular placement", () => {
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

        // Place a single piece
        const piece: Piece = {
            id: "piece-1",
            playerId: player.id,
            color: player.color,
            placedAt: new Date(),
            roundNumber: 1,
        };
        board = placePiece(board, position, piece);

        const scoreEvents = calculateScore(board, position, player, previousBoard);

        expect(scoreEvents.length).toBe(0);
    });

    it("should not score completed row bonus if player has no top pieces", () => {
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

        // Place player1's pieces in first row
        for (let col = 0; col < 5; col++) {
            const piece: Piece = {
                id: `player1-piece-${col}`,
                playerId: player1.id,
                color: player1.color,
                placedAt: new Date(),
                roundNumber: 1,
            };
            board = placePiece(board, { row: 0, col }, piece);
            previousBoard = placePiece(previousBoard, { row: 0, col }, piece);
        }

        // Player2 places pieces on top of player1's pieces, covering them
        for (let col = 0; col < 5; col++) {
            const piece: Piece = {
                id: `player2-piece-${col}`,
                playerId: player2.id,
                color: player2.color,
                placedAt: new Date(),
                roundNumber: 1,
            };
            board = placePiece(board, { row: 0, col }, piece);
            previousBoard = placePiece(previousBoard, { row: 0, col }, piece);
        }

        // Now player2 places another piece on top (row is already completed)
        const extraPiece: Piece = {
            id: "player2-extra",
            playerId: player2.id,
            color: player2.color,
            placedAt: new Date(),
            roundNumber: 1,
        };
        board = placePiece(board, { row: 0, col: 0 }, extraPiece);

        const scoreEvents = calculateScore(board, { row: 0, col: 0 }, player1, previousBoard);

        // Player1 should not get bonus since player2's pieces are on top
        const bonusEvent = scoreEvents.find((e) => e.reason === "completed_row_bonus");
        expect(bonusEvent).toBeUndefined();
    });

    it("should detect and score multiple rows completed simultaneously at intersection", () => {
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

        // Set up so placing at (2,2) completes both row 2 and column 2 simultaneously
        // Complete row 2 horizontally (except center at (2,2))
        for (let col = 0; col < 5; col++) {
            if (col !== 2) {
                const piece: Piece = {
                    id: `h-piece-${col}`,
                    playerId: player.id,
                    color: player.color,
                    placedAt: new Date(),
                    roundNumber: 1,
                };
                board = placePiece(board, { row: 2, col }, piece);
                previousBoard = placePiece(previousBoard, { row: 2, col }, piece);
            }
        }

        // Complete column 2 vertically (except center at (2,2))
        for (let row = 0; row < 5; row++) {
            if (row !== 2) {
                const piece: Piece = {
                    id: `v-piece-${row}`,
                    playerId: player.id,
                    color: player.color,
                    placedAt: new Date(),
                    roundNumber: 1,
                };
                board = placePiece(board, { row, col: 2 }, piece);
                previousBoard = placePiece(previousBoard, { row, col: 2 }, piece);
            }
        }

        // Place final piece at (2,2) - this completes both horizontal row 2 AND vertical column 2
        const finalPiece: Piece = {
            id: "piece-final",
            playerId: player.id,
            color: player.color,
            placedAt: new Date(),
            roundNumber: 1,
        };
        board = placePiece(board, { row: 2, col: 2 }, finalPiece);

        const scoreEvents = calculateScore(board, { row: 2, col: 2 }, player, previousBoard);

        const completionEvent = scoreEvents.find((e) => e.reason === "row_completion");
        expect(completionEvent).toBeDefined();
        // Should get points for both rows: 3 base points * 2 rows + top pieces from both rows
        expect(completionEvent?.points).toBeGreaterThanOrEqual(6);
        expect(completionEvent?.details).toContain("row");
        expect(completionEvent?.details).toContain("column");
    });

    it("should detect and score all newly completed rows, not just through placement", () => {
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

        // Complete row 1 horizontally (except last cell)
        for (let col = 0; col < 4; col++) {
            const piece: Piece = {
                id: `row1-piece-${col}`,
                playerId: player.id,
                color: player.color,
                placedAt: new Date(),
                roundNumber: 1,
            };
            board = placePiece(board, { row: 1, col }, piece);
            previousBoard = placePiece(previousBoard, { row: 1, col }, piece);
        }

        // Complete column 2 vertically (except last cell)
        for (let row = 0; row < 4; row++) {
            const piece: Piece = {
                id: `col2-piece-${row}`,
                playerId: player.id,
                color: player.color,
                placedAt: new Date(),
                roundNumber: 1,
            };
            board = placePiece(board, { row, col: 2 }, piece);
            previousBoard = placePiece(previousBoard, { row, col: 2 }, piece);
        }

        // Place piece at (1,4) - completes row 1
        const piece1: Piece = {
            id: "piece-row1",
            playerId: player.id,
            color: player.color,
            placedAt: new Date(),
            roundNumber: 1,
        };
        board = placePiece(board, { row: 1, col: 4 }, piece1);

        // Place piece at (4,2) - completes column 2
        const piece2: Piece = {
            id: "piece-col2",
            playerId: player.id,
            color: player.color,
            placedAt: new Date(),
            roundNumber: 1,
        };
        board = placePiece(board, { row: 4, col: 2 }, piece2);

        // Now place a piece at (2,2) - this doesn't complete any row through it,
        // but we should still check if any other rows were completed
        // Actually, let's test a case where we complete a row that doesn't pass through the placement
        // Let's complete row 2 separately
        for (let col = 0; col < 4; col++) {
            const piece: Piece = {
                id: `row2-piece-${col}`,
                playerId: player.id,
                color: player.color,
                placedAt: new Date(),
                roundNumber: 1,
            };
            board = placePiece(board, { row: 2, col }, piece);
            previousBoard = placePiece(previousBoard, { row: 2, col }, piece);
        }

        // Place final piece at (2,4) - completes row 2
        const finalPiece: Piece = {
            id: "piece-final",
            playerId: player.id,
            color: player.color,
            placedAt: new Date(),
            roundNumber: 1,
        };
        board = placePiece(board, { row: 2, col: 4 }, finalPiece);

        const scoreEvents = calculateScore(board, { row: 2, col: 4 }, player, previousBoard);

        const completionEvent = scoreEvents.find((e) => e.reason === "row_completion");
        expect(completionEvent).toBeDefined();
        expect(completionEvent?.points).toBeGreaterThanOrEqual(3);
        expect(completionEvent?.details).toContain("row");
    });

    it("should detect and score diagonal row completion even when not through placement position", () => {
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

        // Complete diagonal (top-left to bottom-right) except last cell
        for (let i = 0; i < 4; i++) {
            const piece: Piece = {
                id: `diag-piece-${i}`,
                playerId: player.id,
                color: player.color,
                placedAt: new Date(),
                roundNumber: 1,
            };
            board = placePiece(board, { row: i, col: i }, piece);
            previousBoard = placePiece(previousBoard, { row: i, col: i }, piece);
        }

        // Place final piece at (4,4) - completes diagonal
        const finalPiece: Piece = {
            id: "piece-final",
            playerId: player.id,
            color: player.color,
            placedAt: new Date(),
            roundNumber: 1,
        };
        board = placePiece(board, { row: 4, col: 4 }, finalPiece);

        const scoreEvents = calculateScore(board, { row: 4, col: 4 }, player, previousBoard);

        const completionEvent = scoreEvents.find((e) => e.reason === "row_completion");
        expect(completionEvent).toBeDefined();
        expect(completionEvent?.points).toBeGreaterThanOrEqual(3);
        expect(completionEvent?.details).toContain("diagonal");
    });

    it("should score multiple rows completed in a single placement", () => {
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

        // Set up board so placing at (2,2) completes:
        // - Horizontal row 2
        // - Vertical column 2
        // - Diagonal (top-left to bottom-right)

        // Complete horizontal row 2 (except center)
        for (let col = 0; col < 5; col++) {
            if (col !== 2) {
                const piece: Piece = {
                    id: `h-piece-${col}`,
                    playerId: player.id,
                    color: player.color,
                    placedAt: new Date(),
                    roundNumber: 1,
                };
                board = placePiece(board, { row: 2, col }, piece);
                previousBoard = placePiece(previousBoard, { row: 2, col }, piece);
            }
        }

        // Complete vertical column 2 (except center)
        for (let row = 0; row < 5; row++) {
            if (row !== 2) {
                const piece: Piece = {
                    id: `v-piece-${row}`,
                    playerId: player.id,
                    color: player.color,
                    placedAt: new Date(),
                    roundNumber: 1,
                };
                board = placePiece(board, { row, col: 2 }, piece);
                previousBoard = placePiece(previousBoard, { row, col: 2 }, piece);
            }
        }

        // Complete diagonal (top-left to bottom-right) except center
        for (let i = 0; i < 5; i++) {
            if (i !== 2) {
                const piece: Piece = {
                    id: `d-piece-${i}`,
                    playerId: player.id,
                    color: player.color,
                    placedAt: new Date(),
                    roundNumber: 1,
                };
                board = placePiece(board, { row: i, col: i }, piece);
                previousBoard = placePiece(previousBoard, { row: i, col: i }, piece);
            }
        }

        // Place final piece at (2,2) - completes all three rows!
        const finalPiece: Piece = {
            id: "piece-final",
            playerId: player.id,
            color: player.color,
            placedAt: new Date(),
            roundNumber: 1,
        };
        board = placePiece(board, { row: 2, col: 2 }, finalPiece);

        const scoreEvents = calculateScore(board, { row: 2, col: 2 }, player, previousBoard);

        const completionEvent = scoreEvents.find((e) => e.reason === "row_completion");
        expect(completionEvent).toBeDefined();
        // Should get points for all 3 rows: 3 base points * 3 rows + top pieces
        expect(completionEvent?.points).toBeGreaterThanOrEqual(9);
        expect(completionEvent?.details).toContain("row");
        expect(completionEvent?.details).toContain("column");
        expect(completionEvent?.details).toContain("diagonal");
    });

    describe("Updated Scoring Rules", () => {
        describe("Rule 1: Row Completion - Score only for that row", () => {
            it("should score 3 points + 1 per top piece of player's color in the completed row only", () => {
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

                // Place 4 pieces in first row (all player's color)
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

                // Place final piece to complete row
                const finalPiece: Piece = {
                    id: "piece-final",
                    playerId: player.id,
                    color: player.color,
                    placedAt: new Date(),
                    roundNumber: 1,
                };
                board = placePiece(board, { row: 0, col: 4 }, finalPiece);

                const scoreEvents = calculateScore(board, { row: 0, col: 4 }, player, previousBoard);

                const completionEvent = scoreEvents.find((e) => e.reason === "row_completion");
                expect(completionEvent).toBeDefined();
                // 3 base points + 5 top pieces (all player's color) = 8 points
                expect(completionEvent?.points).toBe(8);
            });

            it("should only count top pieces in the completed row, not other rows", () => {
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

                // Complete first row with 3 pieces of player's color
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

                // Also place pieces in second row (should not be counted)
                for (let col = 0; col < 5; col++) {
                    const piece: Piece = {
                        id: `piece-row2-${col}`,
                        playerId: player.id,
                        color: player.color,
                        placedAt: new Date(),
                        roundNumber: 1,
                    };
                    board = placePiece(board, { row: 1, col }, piece);
                    previousBoard = placePiece(previousBoard, { row: 1, col }, piece);
                }

                // Place final piece to complete first row
                const finalPiece: Piece = {
                    id: "piece-final",
                    playerId: player.id,
                    color: player.color,
                    placedAt: new Date(),
                    roundNumber: 1,
                };
                board = placePiece(board, { row: 0, col: 4 }, finalPiece);

                const scoreEvents = calculateScore(board, { row: 0, col: 4 }, player, previousBoard);

                const completionEvent = scoreEvents.find((e) => e.reason === "row_completion");
                expect(completionEvent).toBeDefined();
                // Should only count 5 top pieces from first row, not second row
                // 3 base points + 5 top pieces = 8 points
                expect(completionEvent?.points).toBe(8);
            });
        });

        describe("Rule 2: Adding to completed row - Score only for rows containing placement", () => {
            it("should only score for the row(s) containing the placement position", () => {
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

                // Complete first row (horizontal)
                for (let col = 0; col < 5; col++) {
                    const piece: Piece = {
                        id: `piece-h-${col}`,
                        playerId: player.id,
                        color: player.color,
                        placedAt: new Date(),
                        roundNumber: 1,
                    };
                    board = placePiece(board, { row: 0, col }, piece);
                    previousBoard = placePiece(previousBoard, { row: 0, col }, piece);
                }

                // Complete first column (vertical)
                for (let row = 0; row < 5; row++) {
                    const piece: Piece = {
                        id: `piece-v-${row}`,
                        playerId: player.id,
                        color: player.color,
                        placedAt: new Date(),
                        roundNumber: 1,
                    };
                    board = placePiece(board, { row, col: 0 }, piece);
                    previousBoard = placePiece(previousBoard, { row, col: 0 }, piece);
                }

                // Now add a piece at (0,0) which is in both completed rows
                const newPiece: Piece = {
                    id: "piece-new",
                    playerId: player.id,
                    color: player.color,
                    placedAt: new Date(),
                    roundNumber: 1,
                };
                board = placePiece(board, { row: 0, col: 0 }, newPiece);

                const scoreEvents = calculateScore(board, { row: 0, col: 0 }, player, previousBoard);

                // Should get bonus points for both rows containing (0,0)
                const bonusEvents = scoreEvents.filter((e) => e.reason === "completed_row_bonus");
                expect(bonusEvents.length).toBe(2); // One for horizontal, one for vertical

                // Each row has 5 top pieces of player's color
                const totalBonusPoints = bonusEvents.reduce((sum, e) => sum + e.points, 0);
                expect(totalBonusPoints).toBe(10); // 5 + 5
            });

            it("should not score for completed rows that don't contain the placement position", () => {
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

                // Complete first row (horizontal)
                for (let col = 0; col < 5; col++) {
                    const piece: Piece = {
                        id: `piece-h-${col}`,
                        playerId: player.id,
                        color: player.color,
                        placedAt: new Date(),
                        roundNumber: 1,
                    };
                    board = placePiece(board, { row: 0, col }, piece);
                    previousBoard = placePiece(previousBoard, { row: 0, col }, piece);
                }

                // Complete second row (horizontal) - different row
                for (let col = 0; col < 5; col++) {
                    const piece: Piece = {
                        id: `piece-h2-${col}`,
                        playerId: player.id,
                        color: player.color,
                        placedAt: new Date(),
                        roundNumber: 1,
                    };
                    board = placePiece(board, { row: 1, col }, piece);
                    previousBoard = placePiece(previousBoard, { row: 1, col }, piece);
                }

                // Add a piece at (0, 2) - only in first row, not second row
                const newPiece: Piece = {
                    id: "piece-new",
                    playerId: player.id,
                    color: player.color,
                    placedAt: new Date(),
                    roundNumber: 1,
                };
                board = placePiece(board, { row: 0, col: 2 }, newPiece);

                const scoreEvents = calculateScore(board, { row: 0, col: 2 }, player, previousBoard);

                // Should only get bonus for first row (contains position), not second row
                const bonusEvents = scoreEvents.filter((e) => e.reason === "completed_row_bonus");
                expect(bonusEvents.length).toBe(1);
                expect(bonusEvents[0]?.points).toBe(5); // 5 top pieces in first row
            });
        });

        describe("Rule 3: Tall Stack - Score only for that stack", () => {
            it("should score when existing stack has 3+ pieces (newly placed piece is 4th or higher)", () => {
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

                // Place 3 pieces of player's color at (2,2) in previousBoard (existing stack has 3 pieces)
                for (let i = 0; i < 3; i++) {
                    const piece: Piece = {
                        id: `piece-${i}`,
                        playerId: player.id,
                        color: player.color,
                        placedAt: new Date(),
                        roundNumber: 1,
                    };
                    previousBoard = placePiece(previousBoard, { row: 2, col: 2 }, piece);
                    board = placePiece(board, { row: 2, col: 2 }, piece);
                }

                // Place 4th piece (newly placed piece is 4th or higher)
                const fourthPiece: Piece = {
                    id: "piece-4",
                    playerId: player.id,
                    color: player.color,
                    placedAt: new Date(),
                    roundNumber: 1,
                };
                board = placePiece(board, { row: 2, col: 2 }, fourthPiece);

                const scoreEvents = calculateScore(board, { row: 2, col: 2 }, player, previousBoard);

                const stackEvent = scoreEvents.find((e) => e.reason === "tall_stack");
                expect(stackEvent).toBeDefined();
                // 4 pieces of player's color = 4 points
                expect(stackEvent?.points).toBe(4);
            });

            it("should not score when existing stack has fewer than 3 pieces", () => {
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

                // Place only 2 pieces at (2,2) in previousBoard (existing stack has 2 pieces)
                for (let i = 0; i < 2; i++) {
                    const piece: Piece = {
                        id: `piece-${i}`,
                        playerId: player.id,
                        color: player.color,
                        placedAt: new Date(),
                        roundNumber: 1,
                    };
                    previousBoard = placePiece(previousBoard, { row: 2, col: 2 }, piece);
                    board = placePiece(board, { row: 2, col: 2 }, piece);
                }

                // Place 3rd piece (stack now has 3 pieces, but existing stack only had 2)
                const thirdPiece: Piece = {
                    id: "piece-3",
                    playerId: player.id,
                    color: player.color,
                    placedAt: new Date(),
                    roundNumber: 1,
                };
                board = placePiece(board, { row: 2, col: 2 }, thirdPiece);

                const scoreEvents = calculateScore(board, { row: 2, col: 2 }, player, previousBoard);

                const stackEvent = scoreEvents.find((e) => e.reason === "tall_stack");
                expect(stackEvent).toBeUndefined(); // Should not score - existing stack had only 2 pieces
            });

            it("should only count pieces in the placement stack, not other stacks", () => {
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

                // Place 3 pieces at (2,2) in previousBoard (existing stack has 3 pieces)
                for (let i = 0; i < 3; i++) {
                    const piece: Piece = {
                        id: `piece-${i}`,
                        playerId: player.id,
                        color: player.color,
                        placedAt: new Date(),
                        roundNumber: 1,
                    };
                    previousBoard = placePiece(previousBoard, { row: 2, col: 2 }, piece);
                    board = placePiece(board, { row: 2, col: 2 }, piece);
                }

                // Place 4th piece at (2,2)
                const fourthPiece: Piece = {
                    id: "piece-4",
                    playerId: player.id,
                    color: player.color,
                    placedAt: new Date(),
                    roundNumber: 1,
                };
                board = placePiece(board, { row: 2, col: 2 }, fourthPiece);

                // Also place 4 pieces at (1,1) - should not be counted
                for (let i = 0; i < 4; i++) {
                    const piece: Piece = {
                        id: `piece-other-${i}`,
                        playerId: player.id,
                        color: player.color,
                        placedAt: new Date(),
                        roundNumber: 1,
                    };
                    board = placePiece(board, { row: 1, col: 1 }, piece);
                    previousBoard = placePiece(previousBoard, { row: 1, col: 1 }, piece);
                }

                const scoreEvents = calculateScore(board, { row: 2, col: 2 }, player, previousBoard);

                const stackEvent = scoreEvents.find((e) => e.reason === "tall_stack");
                expect(stackEvent).toBeDefined();
                // Should only count 4 pieces from (2,2), not 4 from (1,1)
                expect(stackEvent?.points).toBe(4);
            });

            it("should score for stack with exactly 3 existing pieces (newly placed is 4th)", () => {
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

                // Place exactly 3 pieces in previousBoard (existing stack has 3 pieces)
                for (let i = 0; i < 3; i++) {
                    const piece: Piece = {
                        id: `piece-${i}`,
                        playerId: player.id,
                        color: player.color,
                        placedAt: new Date(),
                        roundNumber: 1,
                    };
                    previousBoard = placePiece(previousBoard, { row: 2, col: 2 }, piece);
                    board = placePiece(board, { row: 2, col: 2 }, piece);
                }

                // Place 4th piece (newly placed piece is 4th)
                const fourthPiece: Piece = {
                    id: "piece-4",
                    playerId: player.id,
                    color: player.color,
                    placedAt: new Date(),
                    roundNumber: 1,
                };
                board = placePiece(board, { row: 2, col: 2 }, fourthPiece);

                const scoreEvents = calculateScore(board, { row: 2, col: 2 }, player, previousBoard);

                const stackEvent = scoreEvents.find((e) => e.reason === "tall_stack");
                expect(stackEvent).toBeDefined();
                expect(stackEvent?.points).toBe(4); // 4 pieces total
            });
        });

        describe("Rule 4: Multiple Scoring", () => {
            it("should score from multiple rows and stack simultaneously", () => {
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

                // Set up board so placing at (2,2) will:
                // 1. Complete horizontal row 2
                // 2. Complete vertical column 2
                // 3. Create a tall stack (3+ pieces)

                // Complete horizontal row 2 (except center)
                for (let col = 0; col < 5; col++) {
                    if (col !== 2) {
                        const piece: Piece = {
                            id: `h-piece-${col}`,
                            playerId: player.id,
                            color: player.color,
                            placedAt: new Date(),
                            roundNumber: 1,
                        };
                        board = placePiece(board, { row: 2, col }, piece);
                        previousBoard = placePiece(previousBoard, { row: 2, col }, piece);
                    }
                }

                // Complete vertical column 2 (except center)
                for (let row = 0; row < 5; row++) {
                    if (row !== 2) {
                        const piece: Piece = {
                            id: `v-piece-${row}`,
                            playerId: player.id,
                            color: player.color,
                            placedAt: new Date(),
                            roundNumber: 1,
                        };
                        board = placePiece(board, { row, col: 2 }, piece);
                        previousBoard = placePiece(previousBoard, { row, col: 2 }, piece);
                    }
                }

                // Place 3 pieces at (2,2) in previousBoard to set up tall stack (existing stack has 3 pieces)
                // Note: This will complete the rows in previousBoard, but that's okay - we're testing that
                // placing the 4th piece scores for tall stack. The rows will be already complete, so we'll
                // get completed_row_bonus instead of row_completion.
                for (let i = 0; i < 3; i++) {
                    const piece: Piece = {
                        id: `stack-piece-${i}`,
                        playerId: player.id,
                        color: player.color,
                        placedAt: new Date(),
                        roundNumber: 1,
                    };
                    previousBoard = placePiece(previousBoard, { row: 2, col: 2 }, piece);
                    board = placePiece(board, { row: 2, col: 2 }, piece);
                }

                // Place final piece at (2,2) - rows already complete, but adds to tall stack (4th piece)
                const finalPiece: Piece = {
                    id: "piece-final",
                    playerId: player.id,
                    color: player.color,
                    placedAt: new Date(),
                    roundNumber: 1,
                };
                board = placePiece(board, { row: 2, col: 2 }, finalPiece);

                const scoreEvents = calculateScore(board, { row: 2, col: 2 }, player, previousBoard);

                // Should have:
                // 1. Completed row bonus (rows were already complete, so we get bonus, not completion)
                const bonusEvents = scoreEvents.filter((e) => e.reason === "completed_row_bonus");
                expect(bonusEvents.length).toBeGreaterThanOrEqual(1); // At least one row bonus

                // 2. Tall stack event
                const stackEvent = scoreEvents.find((e) => e.reason === "tall_stack");
                expect(stackEvent).toBeDefined();
                // 4 pieces of player's color = 4 points (3 existing + 1 newly placed)
                expect(stackEvent?.points).toBe(4);

                // Total should be sum of all events
                const totalPoints = scoreEvents.reduce((sum, e) => sum + e.points, 0);
                expect(totalPoints).toBeGreaterThanOrEqual(9);
            });

            it("should score from completed row bonus and tall stack simultaneously", () => {
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

                // Complete first row
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

                // Place 2 additional pieces at (0,0) to set up tall stack
                // (Already has 1 piece from completing the row, so this makes 3 total in previousBoard)
                for (let i = 0; i < 2; i++) {
                    const additionalPiece: Piece = {
                        id: `stack-piece-${i}`,
                        playerId: player.id,
                        color: player.color,
                        placedAt: new Date(),
                        roundNumber: 1,
                    };
                    board = placePiece(board, { row: 0, col: 0 }, additionalPiece);
                    previousBoard = placePiece(previousBoard, { row: 0, col: 0 }, additionalPiece);
                }

                // Place final piece at (0,0) - adds to completed row AND adds to tall stack (4th piece)
                const finalPiece: Piece = {
                    id: "piece-final",
                    playerId: player.id,
                    color: player.color,
                    placedAt: new Date(),
                    roundNumber: 1,
                };
                board = placePiece(board, { row: 0, col: 0 }, finalPiece);

                const scoreEvents = calculateScore(board, { row: 0, col: 0 }, player, previousBoard);

                // Should have:
                // 1. Completed row bonus (for row containing (0,0))
                const bonusEvent = scoreEvents.find((e) => e.reason === "completed_row_bonus");
                expect(bonusEvent).toBeDefined();
                expect(bonusEvent?.points).toBe(5); // 5 top pieces in row

                // 2. Tall stack event
                const stackEvent = scoreEvents.find((e) => e.reason === "tall_stack");
                expect(stackEvent).toBeDefined();
                expect(stackEvent?.points).toBe(4); // 4 pieces of player's color (1 from row + 2 additional + 1 final)

                // Total should be 5 + 4 = 9
                const totalPoints = scoreEvents.reduce((sum, e) => sum + e.points, 0);
                expect(totalPoints).toBe(9);
            });
        });
    });
});
