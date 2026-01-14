import { describe, it, expect } from "vitest";
import {
    createEmptyBoard,
    getValidCells,
    canPlacePiece,
    placePiece,
    getLevelLayout,
} from "../../../src/lib/game/board";
import type { Position } from "../../../src/lib/types/board";
import type { Piece } from "../../../src/lib/types/game";

describe("createEmptyBoard", () => {
    it("should create a 5x5 board", () => {
        const board = createEmptyBoard();
        expect(board.cells).toHaveLength(5);
        board.cells.forEach((row) => {
            expect(row).toHaveLength(5);
        });
    });

    it("should have correct level layout", () => {
        const board = createEmptyBoard();
        const expectedLevels = [
            [5, 4, 3, 4, 5],
            [4, 3, 2, 3, 4],
            [3, 2, 1, 2, 3],
            [4, 3, 2, 3, 4],
            [5, 4, 3, 4, 5],
        ];

        expectedLevels.forEach((row, rowIndex) => {
            row.forEach((level, colIndex) => {
                expect(board.cells[rowIndex][colIndex].level).toBe(level);
            });
        });
    });

    it("should have empty stacks initially", () => {
        const board = createEmptyBoard();
        board.cells.forEach((row) => {
            row.forEach((cell) => {
                expect(cell.stack).toHaveLength(0);
            });
        });
    });

    it("should have correct cell positions", () => {
        const board = createEmptyBoard();
        board.cells.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                expect(cell.row).toBe(rowIndex);
                expect(cell.col).toBe(colIndex);
            });
        });
    });

    it("should have levelLayout property", () => {
        const board = createEmptyBoard();
        expect(board.levelLayout).toBeDefined();
        expect(board.levelLayout).toHaveLength(5);
        board.levelLayout.forEach((row) => {
            expect(row).toHaveLength(5);
        });
    });
});

describe("getLevelLayout", () => {
    it("should return a copy of the level layout", () => {
        const layout1 = getLevelLayout();
        const layout2 = getLevelLayout();
        expect(layout1).toEqual(layout2);
        expect(layout1).not.toBe(layout2); // Should be different objects
    });

    it("should return correct level layout structure", () => {
        const layout = getLevelLayout();
        const expectedLevels = [
            [5, 4, 3, 4, 5],
            [4, 3, 2, 3, 4],
            [3, 2, 1, 2, 3],
            [4, 3, 2, 3, 4],
            [5, 4, 3, 4, 5],
        ];
        expect(layout).toEqual(expectedLevels);
    });
});

describe("getValidCells", () => {
    it("should return center cell only for dice roll 1", () => {
        const board = createEmptyBoard();
        const validCells = getValidCells(1, board);
        expect(validCells).toHaveLength(1);
        expect(validCells[0]).toEqual({ row: 2, col: 2 });
    });

    it("should return all cells of level 2 for dice roll 2", () => {
        const board = createEmptyBoard();
        const validCells = getValidCells(2, board);
        // Level 2 cells: corners of the inner 3x3
        expect(validCells.length).toBeGreaterThan(0);
        validCells.forEach((cell) => {
            expect(board.cells[cell.row][cell.col].level).toBe(2);
        });
    });

    it("should return all cells for dice roll 6", () => {
        const board = createEmptyBoard();
        const validCells = getValidCells(6, board);
        expect(validCells).toHaveLength(25); // All 25 cells
    });

    it("should return all cells of level 3 for dice roll 3", () => {
        const board = createEmptyBoard();
        const validCells = getValidCells(3, board);
        expect(validCells.length).toBeGreaterThan(0);
        validCells.forEach((cell) => {
            expect(board.cells[cell.row][cell.col].level).toBe(3);
        });
    });

    it("should return all cells of level 4 for dice roll 4", () => {
        const board = createEmptyBoard();
        const validCells = getValidCells(4, board);
        expect(validCells.length).toBeGreaterThan(0);
        validCells.forEach((cell) => {
            expect(board.cells[cell.row][cell.col].level).toBe(4);
        });
    });

    it("should return all cells of level 5 for dice roll 5", () => {
        const board = createEmptyBoard();
        const validCells = getValidCells(5, board);
        expect(validCells.length).toBeGreaterThan(0);
        validCells.forEach((cell) => {
            expect(board.cells[cell.row][cell.col].level).toBe(5);
        });
    });

    it("should return unique positions (no duplicates)", () => {
        const board = createEmptyBoard();
        const validCells = getValidCells(6, board);
        const positions = new Set(validCells.map((c) => `${c.row},${c.col}`));
        expect(positions.size).toBe(validCells.length);
    });
});

describe("canPlacePiece", () => {
    it("should allow placement on center for dice roll 1", () => {
        const board = createEmptyBoard();
        const position: Position = { row: 2, col: 2 };
        expect(canPlacePiece(position, 1, board)).toBe(true);
    });

    it("should reject placement outside center for dice roll 1", () => {
        const board = createEmptyBoard();
        const position: Position = { row: 0, col: 0 };
        expect(canPlacePiece(position, 1, board)).toBe(false);
    });

    it("should allow placement anywhere for dice roll 6", () => {
        const board = createEmptyBoard();
        const positions: Position[] = [
            { row: 0, col: 0 },
            { row: 2, col: 2 },
            { row: 4, col: 4 },
        ];
        positions.forEach((position) => {
            expect(canPlacePiece(position, 6, board)).toBe(true);
        });
    });

    it("should reject out of bounds positions", () => {
        const board = createEmptyBoard();
        const invalidPositions: Position[] = [
            { row: -1, col: 0 },
            { row: 5, col: 0 },
            { row: 0, col: -1 },
            { row: 0, col: 5 },
        ];
        invalidPositions.forEach((position) => {
            expect(canPlacePiece(position, 6, board)).toBe(false);
        });
    });

    it("should allow placement on level 2 cells for dice roll 2", () => {
        const board = createEmptyBoard();
        const validCells = getValidCells(2, board);
        validCells.forEach((position) => {
            expect(canPlacePiece(position, 2, board)).toBe(true);
        });
    });

    it("should reject placement on wrong level for dice roll 2", () => {
        const board = createEmptyBoard();
        const centerPosition: Position = { row: 2, col: 2 }; // Level 1
        expect(canPlacePiece(centerPosition, 2, board)).toBe(false);
    });

    it("should allow placement on level 3 cells for dice roll 3", () => {
        const board = createEmptyBoard();
        const validCells = getValidCells(3, board);
        validCells.forEach((position) => {
            expect(canPlacePiece(position, 3, board)).toBe(true);
        });
    });

    it("should allow placement on level 4 cells for dice roll 4", () => {
        const board = createEmptyBoard();
        const validCells = getValidCells(4, board);
        validCells.forEach((position) => {
            expect(canPlacePiece(position, 4, board)).toBe(true);
        });
    });

    it("should allow placement on level 5 cells for dice roll 5", () => {
        const board = createEmptyBoard();
        const validCells = getValidCells(5, board);
        validCells.forEach((position) => {
            expect(canPlacePiece(position, 5, board)).toBe(true);
        });
    });
});

describe("placePiece", () => {
    it("should add piece to cell stack", () => {
        const board = createEmptyBoard();
        const position: Position = { row: 2, col: 2 };
        const piece: Piece = {
            id: "test-piece-1",
            playerId: "player-1",
            color: "pink",
            placedAt: new Date(),
            roundNumber: 1,
        };

        const newBoard = placePiece(board, position, piece);
        expect(newBoard.cells[position.row][position.col].stack).toHaveLength(1);
        expect(newBoard.cells[position.row][position.col].stack[0]).toEqual(piece);
    });

    it("should stack multiple pieces on same cell", () => {
        const board = createEmptyBoard();
        const position: Position = { row: 2, col: 2 };
        const piece1: Piece = {
            id: "test-piece-1",
            playerId: "player-1",
            color: "pink",
            placedAt: new Date(),
            roundNumber: 1,
        };
        const piece2: Piece = {
            id: "test-piece-2",
            playerId: "player-2",
            color: "yellow",
            placedAt: new Date(),
            roundNumber: 1,
        };

        let newBoard = placePiece(board, position, piece1);
        newBoard = placePiece(newBoard, position, piece2);

        expect(newBoard.cells[position.row][position.col].stack).toHaveLength(2);
        expect(newBoard.cells[position.row][position.col].stack[0]).toEqual(piece1);
        expect(newBoard.cells[position.row][position.col].stack[1]).toEqual(piece2);
    });

    it("should not modify original board", () => {
        const board = createEmptyBoard();
        const position: Position = { row: 2, col: 2 };
        const piece: Piece = {
            id: "test-piece-1",
            playerId: "player-1",
            color: "pink",
            placedAt: new Date(),
            roundNumber: 1,
        };

        placePiece(board, position, piece);
        expect(board.cells[position.row][position.col].stack).toHaveLength(0);
    });

    it("should maintain piece order in stack", () => {
        const board = createEmptyBoard();
        const position: Position = { row: 2, col: 2 };
        const pieces: Piece[] = [
            { id: "piece-1", playerId: "player-1", color: "pink", placedAt: new Date(), roundNumber: 1 },
            { id: "piece-2", playerId: "player-2", color: "yellow", placedAt: new Date(), roundNumber: 1 },
            { id: "piece-3", playerId: "player-1", color: "pink", placedAt: new Date(), roundNumber: 1 },
        ];

        let newBoard = board;
        pieces.forEach((piece) => {
            newBoard = placePiece(newBoard, position, piece);
        });

        expect(newBoard.cells[position.row][position.col].stack).toHaveLength(3);
        pieces.forEach((piece, index) => {
            expect(newBoard.cells[position.row][position.col].stack[index]).toEqual(piece);
        });
    });

    it("should place pieces on different cells independently", () => {
        const board = createEmptyBoard();
        const position1: Position = { row: 0, col: 0 };
        const position2: Position = { row: 4, col: 4 };
        const piece1: Piece = {
            id: "piece-1",
            playerId: "player-1",
            color: "pink",
            placedAt: new Date(),
            roundNumber: 1,
        };
        const piece2: Piece = {
            id: "piece-2",
            playerId: "player-2",
            color: "yellow",
            placedAt: new Date(),
            roundNumber: 1,
        };

        let newBoard = placePiece(board, position1, piece1);
        newBoard = placePiece(newBoard, position2, piece2);

        expect(newBoard.cells[position1.row][position1.col].stack).toHaveLength(1);
        expect(newBoard.cells[position1.row][position1.col].stack[0]).toEqual(piece1);
        expect(newBoard.cells[position2.row][position2.col].stack).toHaveLength(1);
        expect(newBoard.cells[position2.row][position2.col].stack[0]).toEqual(piece2);
        // Other cells should remain empty
        expect(newBoard.cells[2][2].stack).toHaveLength(0);
    });

    it("should preserve board structure after placement", () => {
        const board = createEmptyBoard();
        const position: Position = { row: 2, col: 2 };
        const piece: Piece = {
            id: "piece-1",
            playerId: "player-1",
            color: "pink",
            placedAt: new Date(),
            roundNumber: 1,
        };

        const newBoard = placePiece(board, position, piece);

        expect(newBoard.cells).toHaveLength(5);
        newBoard.cells.forEach((row) => {
            expect(row).toHaveLength(5);
        });
        // Check that levels are preserved
        board.cells.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                expect(newBoard.cells[rowIndex][colIndex].level).toBe(cell.level);
            });
        });
    });
});
