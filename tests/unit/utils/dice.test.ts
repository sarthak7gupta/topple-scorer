import { describe, it, expect } from "vitest";
import { rollDice } from "../../../src/lib/utils/dice";

describe("rollDice", () => {
    it("should return a number between 1 and 6", () => {
        const roll = rollDice();
        expect(roll).toBeGreaterThanOrEqual(1);
        expect(roll).toBeLessThanOrEqual(6);
    });

    it("should return an integer", () => {
        const roll = rollDice();
        expect(Number.isInteger(roll)).toBe(true);
    });

    it("should return different values on multiple calls (statistical test)", () => {
        const rolls = new Set();
        for (let i = 0; i < 100; i++) {
            rolls.add(rollDice());
        }
        // After 100 rolls, we should have seen multiple different values
        expect(rolls.size).toBeGreaterThan(1);
    });

    it("should only return valid dice values", () => {
        const validValues = [1, 2, 3, 4, 5, 6];
        for (let i = 0; i < 50; i++) {
            const roll = rollDice();
            expect(validValues).toContain(roll);
        }
    });
});
