import { useGameState } from "../../hooks/useGameState";
import { useBoard } from "../../hooks/useBoard";
import { useSound } from "../../hooks/useSound";
import { Cell } from "./Cell";
import type { Position } from "../../lib/types/board";
import { useEffect, useRef, useCallback } from "react";

export function Board() {
    const { game, placePiece, selectedColor } = useGameState();
    const { board, isValidCell } = useBoard();
    const { playSound } = useSound();
    const cellRefs = useRef<Record<string, HTMLButtonElement>>({});
    const focusedCellRef = useRef<Position | null>(null);

    const handleCellClick = useCallback(
        (position: Position) => {
            if (!game?.diceRoll) {
                return;
            }
            if (game.status !== "playing") {
                return;
            }
            if (!isValidCell(position)) {
                playSound("error");
                return;
            }
            playSound("place");
            // Pass selectedColor in 2-player mode, otherwise undefined
            const currentPlayer = game.players[game.currentPlayerIndex];
            const colorToUse = currentPlayer?.color2 ? selectedColor || undefined : undefined;
            placePiece(position, colorToUse);
        },
        [game, isValidCell, playSound, placePiece, selectedColor]
    );

    // Keyboard navigation for board cells
    useEffect(() => {
        if (!game || !board || game.status !== "playing" || !game.diceRoll) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            // Don't handle if typing in an input
            if (
                event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement ||
                (event.target instanceof HTMLElement && event.target.isContentEditable)
            ) {
                return;
            }

            // Don't handle if a dialog is open
            const isDialogOpen = document.querySelector('[role="dialog"]') !== null;
            if (isDialogOpen) {
                return;
            }

            // Only handle arrow keys when board is active
            if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", " "].includes(event.key)) {
                return;
            }

            const currentPos = focusedCellRef.current || { row: 2, col: 2 }; // Default to center
            let newRow = currentPos.row;
            let newCol = currentPos.col;

            switch (event.key) {
                case "ArrowUp":
                    if (newRow > 0) newRow--;
                    event.preventDefault();
                    break;
                case "ArrowDown":
                    if (newRow < 4) newRow++;
                    event.preventDefault();
                    break;
                case "ArrowLeft":
                    if (newCol > 0) newCol--;
                    event.preventDefault();
                    break;
                case "ArrowRight":
                    if (newCol < 4) newCol++;
                    event.preventDefault();
                    break;
                case "Enter":
                case " ": {
                    // Place piece at current focused cell
                    const pos = focusedCellRef.current || { row: 2, col: 2 };
                    if (isValidCell(pos)) {
                        handleCellClick(pos);
                    }
                    event.preventDefault();
                    return;
                }
                default:
                    return;
            }

            const newPos: Position = { row: newRow, col: newCol };
            const cellKey = `${newRow}-${newCol}`;
            const cellElement = cellRefs.current[cellKey];

            if (cellElement) {
                focusedCellRef.current = newPos;
                cellElement.focus();
            }
        };

        globalThis.addEventListener("keydown", handleKeyDown);
        return () => {
            globalThis.removeEventListener("keydown", handleKeyDown);
        };
    }, [game, board, isValidCell, handleCellClick]);

    if (!game || !board) {
        return (
            <div className="text-center text-gray-500">
                <p>No board available</p>
            </div>
        );
    }

    // Helper functions for labels
    const getRowLabel = (rowIndex: number): string => {
        return String.fromCodePoint(65 + rowIndex); // A, B, C, D, E
    };

    const getColumnLabel = (colIndex: number): string => {
        return String(colIndex + 1);
    };

    return (
        <section className="w-full max-w-xl mx-auto" aria-label="Game board">
            <div className="relative bg-white p-2">
                {/* Column labels (1-5) at the top */}
                <div className="grid grid-cols-6 gap-1.5 mb-1">
                    <div className="col-span-1"></div> {/* Empty space for row labels column */}
                    {[0, 1, 2, 3, 4].map((colIndex) => (
                        <div
                            key={`col-label-${colIndex}`}
                            className="text-center text-sm font-semibold text-gray-700 flex items-center justify-center h-6"
                            aria-label={`Column ${getColumnLabel(colIndex)}`}
                        >
                            {getColumnLabel(colIndex)}
                        </div>
                    ))}
                </div>

                {/* Board grid with row labels */}
                <div
                    className="relative grid grid-cols-6 gap-1.5"
                    role="grid"
                    aria-label="5x5 game board grid. Use arrow keys to navigate cells, Enter or Space to place piece"
                >
                    {/* Diagonal label at top-left corner of A1 cell (outside the cell) */}
                    <span
                        className="absolute top-0 left-[calc(16.666%+0.375rem)] text-xs text-gray-500 z-10 -translate-x-full -translate-y-full"
                        style={{ marginLeft: "-0.25rem", marginTop: "0.25rem" }}
                        aria-label="Diagonal from top-left to bottom-right"
                    >
                        ↘
                    </span>
                    {/* Diagonal label at top-right corner of A5 cell (outside the cell) */}
                    <span
                        className="absolute top-0 right-0 text-xs text-gray-500 z-10 translate-x-full -translate-y-full"
                        style={{ marginRight: "0.25rem", marginTop: "0.25rem" }}
                        aria-label="Diagonal from top-right to bottom-left"
                    >
                        ↙
                    </span>

                    {board.cells.map((row, rowIndex) => {
                        const rowLabel = getRowLabel(rowIndex);
                        return (
                            <div key={`row-${rowLabel}`} className="contents">
                                {/* Row label (A-E) */}
                                <div
                                    className="text-sm font-semibold text-gray-700 flex items-center justify-center"
                                    aria-label={`Row ${rowLabel}`}
                                >
                                    {rowLabel}
                                </div>
                                {/* Row cells */}
                                {row.map((cell, colIndex) => {
                                    const position: Position = {
                                        row: rowIndex,
                                        col: colIndex,
                                    };
                                    const isValid = isValidCell(position);
                                    const isDisabled = !game.diceRoll || game.status !== "playing";

                                    const cellKey = `${rowIndex}-${colIndex}`;
                                    return (
                                        <Cell
                                            key={cellKey}
                                            cell={cell}
                                            isValid={isValid}
                                            onClick={() => {
                                                focusedCellRef.current = position;
                                                handleCellClick(position);
                                            }}
                                            disabled={isDisabled}
                                            onFocus={() => {
                                                focusedCellRef.current = position;
                                            }}
                                            cellRef={(el) => {
                                                if (el) {
                                                    cellRefs.current[cellKey] = el;
                                                } else {
                                                    delete cellRefs.current[cellKey];
                                                }
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
