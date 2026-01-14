import type { Board, Position } from "../types/board";
import type { ScoreEvent } from "../types/game";
import type { Player, PlayerColor } from "../types/player";

/**
 * Checks if a row of 5 is completed through the given position
 * Returns the direction if completed, null otherwise
 */
export function checkRowCompletion(
    board: Board,
    position: Position
): {
    completed: boolean;
    direction: "horizontal" | "vertical" | "diagonal" | null;
} {
    const { row, col } = position;

    // Check horizontal
    const horizontalComplete = board.cells[row].every((cell) => cell.stack.length > 0);
    if (horizontalComplete) {
        return { completed: true, direction: "horizontal" };
    }

    // Check vertical
    const verticalComplete = board.cells.every((rowCells) => rowCells[col].stack.length > 0);
    if (verticalComplete) {
        return { completed: true, direction: "vertical" };
    }

    // Check diagonal (top-left to bottom-right)
    if (row === col) {
        const diagonal1Complete = board.cells.every((rowCells, i) => rowCells[i].stack.length > 0);
        if (diagonal1Complete) {
            return { completed: true, direction: "diagonal" };
        }
    }

    // Check diagonal (top-right to bottom-left)
    if (row + col === 4) {
        const diagonal2Complete = board.cells.every((rowCells, i) => rowCells[4 - i].stack.length > 0);
        if (diagonal2Complete) {
            return { completed: true, direction: "diagonal" };
        }
    }

    return { completed: false, direction: null };
}

type RowDirection = "horizontal" | "vertical" | "diagonal";

interface CompletedRowInfo {
    positions: Position[];
    direction: RowDirection;
    identifier: string;
}

/**
 * Gets the label for a row (A-E)
 */
function getRowLabel(rowIndex: number): string {
    return String.fromCodePoint(65 + rowIndex); // A, B, C, D, E
}

/**
 * Gets the label for a column (1-5)
 */
function getColumnLabel(colIndex: number): string {
    return String(colIndex + 1);
}

/**
 * Gets the label for a diagonal
 */
function getDiagonalLabel(identifier: string): string {
    if (identifier === "diagonal-1") {
        return "diagonal (top-left to bottom-right)";
    } else if (identifier === "diagonal-2") {
        return "diagonal (top-right to bottom-left)";
    }
    return "diagonal";
}

/**
 * Gets a human-readable label for a completed row
 */
function getRowLabelForCompletedRow(completedRow: CompletedRowInfo): string {
    if (completedRow.direction === "horizontal") {
        const rowIndex = completedRow.positions[0]?.row ?? 0;
        return `row ${getRowLabel(rowIndex)}`;
    } else if (completedRow.direction === "vertical") {
        const colIndex = completedRow.positions[0]?.col ?? 0;
        return `column ${getColumnLabel(colIndex)}`;
    } else {
        return getDiagonalLabel(completedRow.identifier);
    }
}

/**
 * Gets all completed rows on the board
 * Returns an array of row information with positions and direction
 */
function getAllCompletedRows(board: Board): CompletedRowInfo[] {
    const completedRows: CompletedRowInfo[] = [];

    // Check all horizontal rows
    for (let row = 0; row < 5; row++) {
        const isComplete = board.cells[row].every((cell) => cell.stack.length > 0);
        if (isComplete) {
            const positions = board.cells[row].map((_, col) => ({ row, col }));
            completedRows.push({
                positions,
                direction: "horizontal",
                identifier: `horizontal-${row}`,
            });
        }
    }

    // Check all vertical rows
    for (let col = 0; col < 5; col++) {
        const isComplete = board.cells.every((rowCells) => rowCells[col].stack.length > 0);
        if (isComplete) {
            const positions = board.cells.map((_, row) => ({ row, col }));
            completedRows.push({
                positions,
                direction: "vertical",
                identifier: `vertical-${col}`,
            });
        }
    }

    // Check diagonal (top-left to bottom-right)
    const diagonal1Complete = board.cells.every((rowCells, i) => rowCells[i].stack.length > 0);
    if (diagonal1Complete) {
        const positions = board.cells.map((_, i) => ({ row: i, col: i }));
        completedRows.push({
            positions,
            direction: "diagonal",
            identifier: "diagonal-1",
        });
    }

    // Check diagonal (top-right to bottom-left)
    const diagonal2Complete = board.cells.every((rowCells, i) => rowCells[4 - i].stack.length > 0);
    if (diagonal2Complete) {
        const positions = board.cells.map((_, i) => ({ row: i, col: 4 - i }));
        completedRows.push({
            positions,
            direction: "diagonal",
            identifier: "diagonal-2",
        });
    }

    return completedRows;
}

/**
 * Gets the score for pieces of a player's color in a stack
 */
export function getStackScore(
    cell: { stack: Array<{ color: PlayerColor; playerId: string }> },
    playerId: string
): number {
    return cell.stack.filter((piece) => piece.playerId === playerId).length;
}

/**
 * Gets the top piece color for each cell in a row
 */
function getTopPieceColors(
    board: Board,
    positions: Position[]
): Array<{ color: PlayerColor; playerId: string } | null> {
    return positions.map((pos) => {
        const cell = board.cells[pos.row][pos.col];
        const topPiece = cell.stack[cell.stack.length - 1];
        return topPiece ? { color: topPiece.color, playerId: topPiece.playerId } : null;
    });
}

/**
 * Gets all rows that contain the given position
 */
function getRowsContainingPosition(
    position: Position,
    completedRows: Array<{
        positions: Position[];
        direction: "horizontal" | "vertical" | "diagonal";
        identifier: string;
    }>
): Array<{
    positions: Position[];
    direction: "horizontal" | "vertical" | "diagonal";
    identifier: string;
}> {
    return completedRows.filter((row) =>
        row.positions.some((pos) => pos.row === position.row && pos.col === position.col)
    );
}

/**
 * Calculates score for a placement
 * @param selectedColor - In 2-player mode, only score pieces of this color
 */
export function calculateScore(
    board: Board,
    position: Position,
    player: Player,
    previousBoard: Board,
    selectedColor?: PlayerColor
): ScoreEvent[] {
    const scoreEvents: ScoreEvent[] = [];
    const cell = board.cells[position.row][position.col];

    // Check for row completion - find ALL rows that were just completed
    const currentCompletedRows = getAllCompletedRows(board);
    const previousCompletedRows = getAllCompletedRows(previousBoard);
    const previousRowIdentifiers = new Set(previousCompletedRows.map((r) => r.identifier));

    // Find rows that are complete now but weren't before (newly completed rows)
    const newlyCompletedRows = currentCompletedRows.filter((row) => !previousRowIdentifiers.has(row.identifier));

    // Determine color to match (for 2-player mode)
    const colorToMatch = selectedColor || player.color;

    if (newlyCompletedRows.length > 0) {
        // Rule 1: Award points for each newly completed row
        // 3 points base + 1 point per top piece of player's color in THAT row
        let totalPoints = 0;
        const rowDetails: string[] = [];

        for (const completedRow of newlyCompletedRows) {
            // 3 points base for completing a row
            let rowPoints = 3;

            // Count top pieces of player's color in this row only
            const topPieces = getTopPieceColors(board, completedRow.positions);
            const playerTopPieces = topPieces.filter(
                (piece) => piece && piece.playerId === player.id && piece.color === colorToMatch
            ).length;
            rowPoints += playerTopPieces;

            totalPoints += rowPoints;
            rowDetails.push(getRowLabelForCompletedRow(completedRow));
        }

        // Create a single score event for all newly completed rows
        scoreEvents.push({
            id: `score-${Date.now()}-${Math.random()}`,
            playerId: player.id,
            points: totalPoints,
            reason: "row_completion",
            timestamp: new Date(),
            roundNumber: 0, // Will be set by caller
            details: `Completed ${rowDetails.join(", ")}`,
        });
    }

    // Check for bonus points when adding to already-completed rows (not newly completed)
    // Rule 2: Only score for the row(s) that the placement position is part of, not all completed rows
    const newlyCompletedIdentifiers = new Set(newlyCompletedRows.map((r) => r.identifier));

    // Find which already-completed rows contain the placement position
    const rowsContainingPosition = getRowsContainingPosition(position, previousCompletedRows);

    for (const completedRow of rowsContainingPosition) {
        // Skip rows that were just completed (they got row_completion points above)
        if (newlyCompletedIdentifiers.has(completedRow.identifier)) {
            continue;
        }

        // Check if this row is still completed (might have been disrupted)
        const isStillComplete = currentCompletedRows.some((r) => r.identifier === completedRow.identifier);
        if (!isStillComplete) {
            continue;
        }

        // Rule 2: Score 1 point per top piece of player's color in THIS row only
        const topPieces = getTopPieceColors(board, completedRow.positions);
        const playerTopPieces = topPieces.filter(
            (piece) => piece && piece.playerId === player.id && piece.color === colorToMatch
        ).length;

        if (playerTopPieces > 0) {
            scoreEvents.push({
                id: `score-${Date.now()}-${Math.random()}`,
                playerId: player.id,
                points: playerTopPieces,
                reason: "completed_row_bonus",
                timestamp: new Date(),
                roundNumber: 0,
                details: `Added to completed ${getRowLabelForCompletedRow(completedRow)}`,
            });
        }
    }

    // Rule 3: Check for tall stack (existing stack has 3+ pieces, newly placed piece is 4th or higher)
    // Score 1 point per piece of player's color in THIS stack only
    const previousCell = previousBoard.cells[position.row][position.col];
    const previousStackLength = previousCell.stack.length;

    // Only score if the stack had 3+ pieces before placement (newly placed piece is 4th or higher)
    if (previousStackLength >= 3) {
        // In 2-player mode, only count pieces of the selected color
        const playerPieces = cell.stack.filter((p) => p.playerId === player.id && p.color === colorToMatch).length;
        if (playerPieces > 0) {
            scoreEvents.push({
                id: `score-${Date.now()}-${Math.random()}`,
                playerId: player.id,
                points: playerPieces,
                reason: "tall_stack",
                timestamp: new Date(),
                roundNumber: 0,
                details: `Stack has ${cell.stack.length} pieces`,
            });
        }
    }

    return scoreEvents;
}
