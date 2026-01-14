import type { Board, Cell, Position } from "../types/board";
import type { DiceRoll, Piece } from "../types/game";

// Static level layout for the 5x5 board
const LEVEL_LAYOUT: number[][] = [
    [5, 4, 3, 4, 5],
    [4, 3, 2, 3, 4],
    [3, 2, 1, 2, 3],
    [4, 3, 2, 3, 4],
    [5, 4, 3, 4, 5],
];

/**
 * Gets the static level layout
 */
export function getLevelLayout(): number[][] {
    return LEVEL_LAYOUT.map((row) => [...row]);
}

/**
 * Creates an empty board with all cells initialized
 */
export function createEmptyBoard(): Board {
    const cells: Cell[][] = [];

    for (let row = 0; row < 5; row++) {
        const rowCells: Cell[] = [];
        for (let col = 0; col < 5; col++) {
            rowCells.push({
                row,
                col,
                level: LEVEL_LAYOUT[row][col],
                stack: [],
            });
        }
        cells.push(rowCells);
    }

    return {
        cells,
        levelLayout: getLevelLayout(),
    };
}

/**
 * Gets valid cell positions based on dice roll
 * - Dice 1: Only center cell (2,2)
 * - Dice 2-5: All cells with matching level
 * - Dice 6: All cells
 */
export function getValidCells(diceRoll: DiceRoll, board: Board): Position[] {
    const validCells: Position[] = [];

    if (diceRoll === 1) {
        // Only center cell
        validCells.push({ row: 2, col: 2 });
    } else if (diceRoll >= 2 && diceRoll <= 5) {
        // All cells with matching level
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                if (board.cells[row][col].level === diceRoll) {
                    validCells.push({ row, col });
                }
            }
        }
    } else if (diceRoll === 6) {
        // All cells
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                validCells.push({ row, col });
            }
        }
    }

    return validCells;
}

/**
 * Checks if a piece can be placed at the given position based on dice roll
 */
export function canPlacePiece(position: Position, diceRoll: DiceRoll, board: Board): boolean {
    // Check bounds
    if (position.row < 0 || position.row >= 5 || position.col < 0 || position.col >= 5) {
        return false;
    }

    const validCells = getValidCells(diceRoll, board);
    return validCells.some((cell) => cell.row === position.row && cell.col === position.col);
}

/**
 * Places a piece on the board at the given position
 */
export function placePiece(board: Board, position: Position, piece: Piece): Board {
    // Create a deep copy of the board
    const newCells = board.cells.map((row) =>
        row.map((cell) => ({
            ...cell,
            stack: [...cell.stack],
        }))
    );

    // Add piece to the stack
    newCells[position.row][position.col].stack.push(piece);

    return {
        ...board,
        cells: newCells,
    };
}
