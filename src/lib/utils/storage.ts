import type { Game, GameConfig } from "../types/game";

const STORAGE_KEY = "topple-game-state";
const CONFIG_STORAGE_KEY = "topple-game-config";

/**
 * Saves game state to localStorage
 */
export function saveGame(game: Game): void {
    try {
        const serialized = JSON.stringify(game, (_key, value) => {
            // Convert Date objects to ISO strings for serialization
            if (value instanceof Date) {
                return value.toISOString();
            }
            return value;
        });
        localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
        console.error("Failed to save game state:", error);
    }
}

/**
 * Loads game state from localStorage
 */
export function loadGame(): Game | null {
    try {
        const serialized = localStorage.getItem(STORAGE_KEY);
        if (!serialized) {
            return null;
        }
        const parsed = JSON.parse(serialized);
        // Restore Date objects from ISO strings
        if (parsed.createdAt) parsed.createdAt = new Date(parsed.createdAt);
        if (parsed.updatedAt) parsed.updatedAt = new Date(parsed.updatedAt);

        // Initialize log if missing (for older saved games)
        if (!parsed.log || !Array.isArray(parsed.log)) {
            parsed.log = [];
        } else {
            // Restore Date objects in log entries
            parsed.log = parsed.log.map((entry: any) => ({
                ...entry,
                timestamp: entry.timestamp ? new Date(entry.timestamp) : new Date(),
            }));
        }

        // Restore dates in board cells (pieces)
        if (parsed.board?.cells) {
            for (const row of parsed.board.cells) {
                for (const cell of row) {
                    if (cell.stack) {
                        for (const piece of cell.stack) {
                            if (piece.placedAt) piece.placedAt = new Date(piece.placedAt);
                        }
                    }
                }
            }
        }
        return parsed as Game;
    } catch (error) {
        console.error("Failed to load game state:", error);
        return null;
    }
}

/**
 * Clears game state from localStorage
 */
export function clearGame(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error("Failed to clear game state:", error);
    }
}

/**
 * Checks if a saved game exists
 */
export function hasSavedGame(): boolean {
    try {
        return localStorage.getItem(STORAGE_KEY) !== null;
    } catch {
        return false;
    }
}

/**
 * Saves game configuration (player names, colors, order, victory points) to localStorage
 */
export function saveGameConfig(config: GameConfig): void {
    try {
        const serialized = JSON.stringify(config);
        localStorage.setItem(CONFIG_STORAGE_KEY, serialized);
        // Dispatch event to notify components of config change
        globalThis.dispatchEvent(new Event("gameConfigChanged"));
    } catch (error) {
        console.error("Failed to save game config:", error);
    }
}

/**
 * Loads game configuration from localStorage
 */
export function loadGameConfig(): GameConfig | null {
    try {
        const serialized = localStorage.getItem(CONFIG_STORAGE_KEY);
        if (!serialized) {
            return null;
        }
        return JSON.parse(serialized) as GameConfig;
    } catch (error) {
        console.error("Failed to load game config:", error);
        return null;
    }
}

/**
 * Clears game configuration from localStorage
 */
export function clearGameConfig(): void {
    try {
        localStorage.removeItem(CONFIG_STORAGE_KEY);
    } catch (error) {
        console.error("Failed to clear game config:", error);
    }
}
