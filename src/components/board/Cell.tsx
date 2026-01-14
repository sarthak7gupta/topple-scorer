import { useTranslation } from "react-i18next";
import type { Cell as CellType } from "../../lib/types/board";
import { PieceStack } from "./PieceStack";

interface CellProps {
    readonly cell: CellType;
    readonly isValid: boolean;
    readonly onClick: () => void;
    readonly disabled?: boolean;
    readonly onFocus?: () => void;
    readonly cellRef?: (el: HTMLButtonElement | null) => void;
}

export function Cell({ cell, isValid, onClick, disabled, onFocus, cellRef }: CellProps) {
    const { t } = useTranslation();
    const handleClick = () => {
        if (!disabled && isValid) {
            onClick();
        }
    };

    const handleFocus = () => {
        if (onFocus) {
            onFocus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Allow Enter and Space to trigger click
        if ((e.key === "Enter" || e.key === " ") && !disabled && isValid) {
            e.preventDefault();
            onClick();
        }
    };

    return (
        <button
            type="button"
            ref={cellRef}
            onClick={handleClick}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            disabled={disabled || !isValid}
            className={`
        relative w-full h-full min-h-[80px] transition-all duration-200
        ${
            isValid && !disabled
                ? "ring-4 ring-blue-400 ring-opacity-50 cursor-pointer hover:ring-opacity-75 focus:ring-opacity-100 focus:outline-none focus:ring-4 focus:ring-blue-500"
                : "cursor-default"
        }
        ${disabled ? "opacity-50" : ""}
      `}
            aria-label={
                t("board.cell", {
                    row: cell.row + 1,
                    col: cell.col + 1,
                    level: cell.level,
                    pieces: cell.stack.length,
                }) + (isValid && !disabled ? t("board.validPlacement") : "")
            }
            tabIndex={isValid && !disabled ? 0 : -1}
            aria-disabled={disabled || !isValid}
        >
            <PieceStack pieces={cell.stack} level={cell.level} />
        </button>
    );
}
