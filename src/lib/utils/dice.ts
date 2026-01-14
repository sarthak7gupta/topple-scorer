// Dice roll result type
export type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Rolls a 6-sided die using cryptographically secure random number generation
 * @returns A random integer between 1 and 6 (inclusive)
 */
export function rollDice(): DiceRoll {
    // Use crypto.getRandomValues for secure randomness
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    // Convert to 1-6 range
    return ((array[0] % 6) + 1) as DiceRoll;
}
