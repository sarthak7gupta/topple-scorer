import type { Piece } from "./game";

// Board position
export interface Position {
    row: number; // 0-4
    col: number; // 0-4
}

// Cell entity
export interface Cell {
    row: number;
    col: number;
    level: number; // 1-5
    stack: Piece[];
}

// Board entity
export interface Board {
    cells: Cell[][]; // 5x5 grid
    levelLayout: number[][]; // Static 5x5 level values
}
