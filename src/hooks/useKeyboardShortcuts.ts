import { useEffect } from "react";
import { getSoundEnabled, setSoundEnabled } from "../lib/utils/sound";
import { useGameState } from "./useGameState";

/**
 * Custom hook for keyboard shortcuts
 * Must be called within GameProvider
 */
export function useKeyboardShortcuts() {
    const { game, rollDice, undo, canUndo, redo, canRedo, resetGame, placePiece } = useGameState();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in inputs
            if (
                event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement ||
                (event.target instanceof HTMLElement && event.target.isContentEditable)
            ) {
                return;
            }

            // Don't trigger if a dialog is open
            const isDialogOpen = document.querySelector('[role="dialog"]') !== null;
            if (isDialogOpen && event.key !== "Escape") {
                return;
            }

            switch (event.key) {
                case " ":
                case "Enter":
                    // Roll dice
                    if (game?.status === "playing" && !game.diceRoll) {
                        event.preventDefault();
                        rollDice();
                    }
                    break;

                case "z":
                case "Z": {
                    // Ctrl/Cmd+Z: Undo
                    // Ctrl/Cmd+Shift+Z: Redo
                    const isModifierPressed = event.metaKey || event.ctrlKey;
                    const isShiftPressed = event.shiftKey;

                    if (isModifierPressed) {
                        if (isShiftPressed) {
                            // Cmd/Ctrl+Shift+Z: Redo
                            if (canRedo) {
                                event.preventDefault();
                                redo();
                            }
                            // Cmd/Ctrl+Z: Undo
                        } else if (canUndo) {
                            event.preventDefault();
                            undo();
                        }
                    }
                    break;
                }

                case "y":
                case "Y": {
                    // Ctrl/Cmd+Y: Redo
                    const isModifierPressed = event.metaKey || event.ctrlKey;
                    if (isModifierPressed && canRedo) {
                        event.preventDefault();
                        redo();
                    }
                    break;
                }

                case "r":
                case "R": {
                    // R: Reset game (with confirmation)
                    // Command/Ctrl+Shift+R: Allow default browser hard refresh behavior
                    // Command/Ctrl+R: Allow default browser refresh behavior
                    const isModifierPressed = event.metaKey || event.ctrlKey;
                    const isShiftPressed = event.shiftKey;

                    if (isModifierPressed && isShiftPressed) {
                        // Cmd/Ctrl+Shift+R: Allow browser hard refresh (don't prevent default)
                        return; // Let the browser handle hard refresh
                    } else if (!isModifierPressed) {
                        // Reset game with just R (no modifiers)
                        if (game && !isDialogOpen) {
                            event.preventDefault();
                            if (
                                confirm(
                                    "Are you sure you want to reset the game? This will clear all progress and return to the setup screen."
                                )
                            ) {
                                resetGame();
                            }
                        }
                    }
                    // If it's Command/Ctrl+R (without Shift), don't prevent default - let browser refresh
                    break;
                }

                case "/": {
                    // Cmd/Ctrl+/ to open menu
                    const isModifierPressed = event.metaKey || event.ctrlKey;
                    if (isModifierPressed) {
                        event.preventDefault();
                        const menuButton = document.getElementById("game-menu-button");
                        if (menuButton && game && game.status !== "setup") {
                            menuButton.click();
                        }
                    }
                    break;
                }

                case "m":
                case "M": {
                    // Toggle sound
                    event.preventDefault();
                    const currentSoundEnabled = getSoundEnabled();
                    setSoundEnabled(!currentSoundEnabled);
                    // Dispatch custom event for same-tab updates
                    globalThis.dispatchEvent(new Event("soundSettingChanged"));
                    break;
                }

                case "Escape": {
                    // Close dialogs
                    const dialog = document.querySelector('[role="dialog"]');
                    if (dialog) {
                        const closeButton = dialog.querySelector("[data-radix-dialog-close]") as HTMLElement;
                        if (closeButton) {
                            closeButton.click();
                        }
                    }
                    break;
                }

                // Arrow keys for board navigation (accessibility)
                case "ArrowUp":
                case "ArrowDown":
                case "ArrowLeft":
                case "ArrowRight":
                    // Board navigation could be implemented here
                    // For now, we'll just prevent default to avoid scrolling
                    if (game?.status === "playing" && game.diceRoll) {
                        // Could implement cell navigation here
                    }
                    break;
            }
        };

        globalThis.addEventListener("keydown", handleKeyDown);
        return () => {
            globalThis.removeEventListener("keydown", handleKeyDown);
        };
    }, [game, rollDice, undo, canUndo, redo, canRedo, resetGame, placePiece]);
}
