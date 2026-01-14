import type { GameConfig, PlayerConfig } from "../types/game";
import type { PlayerColor } from "../types/player";

/**
 * Validates game configuration
 */
export function validateGameConfig(config: GameConfig): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    // Validate player count
    if (config.playerCount < 2 || config.playerCount > 4) {
        errors.push("Player count must be between 2 and 4");
    }

    // Validate players array length matches player count
    if (config.players.length !== config.playerCount) {
        errors.push(`Players array length (${config.players.length}) must match player count (${config.playerCount})`);
    }

    // Validate victory points
    if (config.victoryPoints <= 0 || !Number.isInteger(config.victoryPoints)) {
        errors.push("Victory points must be a positive integer");
    }

    // Validate each player
    const usedColors = new Set<PlayerColor>();
    const usedOrders = new Set<number>();

    for (let i = 0; i < config.players.length; i++) {
        const player = config.players[i];
        const playerErrors = validatePlayerConfig(player, i, config.playerCount === 2);
        errors.push(...playerErrors);

        // Check for duplicate colors (unless 2-player mode)
        if (config.playerCount === 2) {
            // In 2-player mode, each player can have 2 colors, but they must be unique
            if (usedColors.has(player.color)) {
                errors.push(`Player ${i + 1}: Color ${player.color} is already used`);
            }
            usedColors.add(player.color);
            if (player.color2) {
                if (usedColors.has(player.color2)) {
                    errors.push(`Player ${i + 1}: Color ${player.color2} is already used`);
                }
                usedColors.add(player.color2);
            }
        } else {
            // In multi-player mode, colors must be unique
            if (usedColors.has(player.color)) {
                errors.push(`Player ${i + 1}: Color ${player.color} is already used`);
            }
            usedColors.add(player.color);
        }

        // Check for duplicate orders
        if (usedOrders.has(player.order)) {
            errors.push(`Player ${i + 1}: Order ${player.order} is already used`);
        }
        usedOrders.add(player.order);
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validates a single player configuration
 */
function validatePlayerConfig(player: PlayerConfig, index: number, isTwoPlayerMode: boolean): string[] {
    const errors: string[] = [];

    if (!player.name || player.name.trim().length === 0) {
        errors.push(`Player ${index + 1}: Name is required`);
    }

    const validColors: Set<PlayerColor> = new Set(["pink", "yellow", "orange", "purple"]);
    if (!validColors.has(player.color)) {
        errors.push(`Player ${index + 1}: Invalid color ${player.color}`);
    }

    if (isTwoPlayerMode && player.color2) {
        if (!validColors.has(player.color2)) {
            errors.push(`Player ${index + 1}: Invalid second color ${player.color2}`);
        }
        if (player.color === player.color2) {
            errors.push(`Player ${index + 1}: Primary and secondary colors must be different`);
        }
    }

    if (player.order < 0 || player.order >= 4) {
        errors.push(`Player ${index + 1}: Order must be between 0 and 3`);
    }

    return errors;
}
