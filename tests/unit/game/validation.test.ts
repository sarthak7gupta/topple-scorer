import { describe, it, expect } from "vitest";
import { validateGameConfig } from "../../../src/lib/game/validation";
import type { GameConfig } from "../../../src/lib/types/game";

describe("validateGameConfig", () => {
    describe("valid configurations", () => {
        it("should validate a valid 2-player configuration", () => {
            const config: GameConfig = {
                playerCount: 2,
                players: [
                    { name: "Player 1", color: "pink", order: 0 },
                    { name: "Player 2", color: "yellow", order: 1 },
                ],
                victoryPoints: 20,
            };

            const result = validateGameConfig(config);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it("should validate a valid 2-player configuration with second colors", () => {
            const config: GameConfig = {
                playerCount: 2,
                players: [
                    { name: "Player 1", color: "pink", color2: "orange", order: 0 },
                    { name: "Player 2", color: "yellow", color2: "purple", order: 1 },
                ],
                victoryPoints: 20,
            };

            const result = validateGameConfig(config);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it("should validate a valid 3-player configuration", () => {
            const config: GameConfig = {
                playerCount: 3,
                players: [
                    { name: "Player 1", color: "pink", order: 0 },
                    { name: "Player 2", color: "yellow", order: 1 },
                    { name: "Player 3", color: "orange", order: 2 },
                ],
                victoryPoints: 20,
            };

            const result = validateGameConfig(config);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it("should validate a valid 4-player configuration", () => {
            const config: GameConfig = {
                playerCount: 4,
                players: [
                    { name: "Player 1", color: "pink", order: 0 },
                    { name: "Player 2", color: "yellow", order: 1 },
                    { name: "Player 3", color: "orange", order: 2 },
                    { name: "Player 4", color: "purple", order: 3 },
                ],
                victoryPoints: 20,
            };

            const result = validateGameConfig(config);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });

    describe("player count validation", () => {
        it("should reject player count less than 2", () => {
            const config: GameConfig = {
                playerCount: 1,
                players: [{ name: "Player 1", color: "pink", order: 0 }],
                victoryPoints: 20,
            };

            const result = validateGameConfig(config);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("Player count must be between 2 and 4");
        });

        it("should reject player count greater than 4", () => {
            const config: GameConfig = {
                playerCount: 5,
                players: [
                    { name: "Player 1", color: "pink", order: 0 },
                    { name: "Player 2", color: "yellow", order: 1 },
                    { name: "Player 3", color: "orange", order: 2 },
                    { name: "Player 4", color: "purple", order: 3 },
                    { name: "Player 5", color: "pink", order: 4 },
                ],
                victoryPoints: 20,
            };

            const result = validateGameConfig(config);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("Player count must be between 2 and 4");
        });

        it("should reject when players array length doesn't match player count", () => {
            const config: GameConfig = {
                playerCount: 3,
                players: [
                    { name: "Player 1", color: "pink", order: 0 },
                    { name: "Player 2", color: "yellow", order: 1 },
                ],
                victoryPoints: 20,
            };

            const result = validateGameConfig(config);
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes("Players array length"))).toBe(true);
        });
    });

    describe("victory points validation", () => {
        it("should reject zero victory points", () => {
            const config: GameConfig = {
                playerCount: 2,
                players: [
                    { name: "Player 1", color: "pink", order: 0 },
                    { name: "Player 2", color: "yellow", order: 1 },
                ],
                victoryPoints: 0,
            };

            const result = validateGameConfig(config);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("Victory points must be a positive integer");
        });

        it("should reject negative victory points", () => {
            const config: GameConfig = {
                playerCount: 2,
                players: [
                    { name: "Player 1", color: "pink", order: 0 },
                    { name: "Player 2", color: "yellow", order: 1 },
                ],
                victoryPoints: -5,
            };

            const result = validateGameConfig(config);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("Victory points must be a positive integer");
        });

        it("should reject non-integer victory points", () => {
            const config: GameConfig = {
                playerCount: 2,
                players: [
                    { name: "Player 1", color: "pink", order: 0 },
                    { name: "Player 2", color: "yellow", order: 1 },
                ],
                victoryPoints: 20.5,
            };

            const result = validateGameConfig(config);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("Victory points must be a positive integer");
        });

        it("should accept positive integer victory points", () => {
            const config: GameConfig = {
                playerCount: 2,
                players: [
                    { name: "Player 1", color: "pink", order: 0 },
                    { name: "Player 2", color: "yellow", order: 1 },
                ],
                victoryPoints: 25,
            };

            const result = validateGameConfig(config);
            expect(result.valid).toBe(true);
        });
    });

    describe("player name validation", () => {
        it("should reject empty player name", () => {
            const config: GameConfig = {
                playerCount: 2,
                players: [
                    { name: "", color: "pink", order: 0 },
                    { name: "Player 2", color: "yellow", order: 1 },
                ],
                victoryPoints: 20,
            };

            const result = validateGameConfig(config);
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes("Name is required"))).toBe(true);
        });

        it("should reject whitespace-only player name", () => {
            const config: GameConfig = {
                playerCount: 2,
                players: [
                    { name: "   ", color: "pink", order: 0 },
                    { name: "Player 2", color: "yellow", order: 1 },
                ],
                victoryPoints: 20,
            };

            const result = validateGameConfig(config);
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes("Name is required"))).toBe(true);
        });

        it("should accept valid player names", () => {
            const config: GameConfig = {
                playerCount: 2,
                players: [
                    { name: "Player 1", color: "pink", order: 0 },
                    { name: "Player 2", color: "yellow", order: 1 },
                ],
                victoryPoints: 20,
            };

            const result = validateGameConfig(config);
            expect(result.valid).toBe(true);
        });
    });

    describe("player color validation", () => {
        it("should reject invalid color", () => {
            const config: GameConfig = {
                playerCount: 2,
                players: [
                    { name: "Player 1", color: "red" as any, order: 0 },
                    { name: "Player 2", color: "yellow", order: 1 },
                ],
                victoryPoints: 20,
            };

            const result = validateGameConfig(config);
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes("Invalid color"))).toBe(true);
        });

        it("should accept valid colors", () => {
            const validColors = ["pink", "yellow", "orange", "purple"];
            const otherColors = ["yellow", "pink", "purple", "orange"];
            for (let i = 0; i < validColors.length; i++) {
                const color = validColors[i];
                const otherColor = otherColors[i];
                const config: GameConfig = {
                    playerCount: 2,
                    players: [
                        { name: "Player 1", color: color as any, order: 0 },
                        { name: "Player 2", color: otherColor as any, order: 1 },
                    ],
                    victoryPoints: 20,
                };

                const result = validateGameConfig(config);
                expect(result.valid).toBe(true);
            }
        });
    });

    describe("2-player mode color validation", () => {
        it("should reject invalid second color", () => {
            const config: GameConfig = {
                playerCount: 2,
                players: [
                    { name: "Player 1", color: "pink", color2: "red" as any, order: 0 },
                    { name: "Player 2", color: "yellow", order: 1 },
                ],
                victoryPoints: 20,
            };

            const result = validateGameConfig(config);
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes("Invalid second color"))).toBe(true);
        });

        it("should reject when primary and secondary colors are the same", () => {
            const config: GameConfig = {
                playerCount: 2,
                players: [
                    { name: "Player 1", color: "pink", color2: "pink", order: 0 },
                    { name: "Player 2", color: "yellow", order: 1 },
                ],
                victoryPoints: 20,
            };

            const result = validateGameConfig(config);
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes("Primary and secondary colors must be different"))).toBe(true);
        });

        it("should accept different primary and secondary colors", () => {
            const config: GameConfig = {
                playerCount: 2,
                players: [
                    { name: "Player 1", color: "pink", color2: "orange", order: 0 },
                    { name: "Player 2", color: "yellow", color2: "purple", order: 1 },
                ],
                victoryPoints: 20,
            };

            const result = validateGameConfig(config);
            expect(result.valid).toBe(true);
        });
    });

    describe("color uniqueness validation", () => {
        it("should reject duplicate colors in 2-player mode (primary colors)", () => {
            const config: GameConfig = {
                playerCount: 2,
                players: [
                    { name: "Player 1", color: "pink", order: 0 },
                    { name: "Player 2", color: "pink", order: 1 },
                ],
                victoryPoints: 20,
            };

            const result = validateGameConfig(config);
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes("Color pink is already used"))).toBe(true);
        });

        it("should reject duplicate colors in 2-player mode (primary and secondary)", () => {
            const config: GameConfig = {
                playerCount: 2,
                players: [
                    { name: "Player 1", color: "pink", color2: "orange", order: 0 },
                    { name: "Player 2", color: "yellow", color2: "pink", order: 1 },
                ],
                victoryPoints: 20,
            };

            const result = validateGameConfig(config);
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes("Color pink is already used"))).toBe(true);
        });

        it("should reject duplicate colors in 2-player mode (secondary colors)", () => {
            const config: GameConfig = {
                playerCount: 2,
                players: [
                    { name: "Player 1", color: "pink", color2: "orange", order: 0 },
                    { name: "Player 2", color: "yellow", color2: "orange", order: 1 },
                ],
                victoryPoints: 20,
            };

            const result = validateGameConfig(config);
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes("Color orange is already used"))).toBe(true);
        });

        it("should reject duplicate colors in multi-player mode", () => {
            const config: GameConfig = {
                playerCount: 3,
                players: [
                    { name: "Player 1", color: "pink", order: 0 },
                    { name: "Player 2", color: "yellow", order: 1 },
                    { name: "Player 3", color: "pink", order: 2 },
                ],
                victoryPoints: 20,
            };

            const result = validateGameConfig(config);
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes("Color pink is already used"))).toBe(true);
        });

        it("should accept unique colors in 2-player mode", () => {
            const config: GameConfig = {
                playerCount: 2,
                players: [
                    { name: "Player 1", color: "pink", color2: "orange", order: 0 },
                    { name: "Player 2", color: "yellow", color2: "purple", order: 1 },
                ],
                victoryPoints: 20,
            };

            const result = validateGameConfig(config);
            expect(result.valid).toBe(true);
        });
    });

    describe("player order validation", () => {
        it("should reject negative order", () => {
            const config: GameConfig = {
                playerCount: 2,
                players: [
                    { name: "Player 1", color: "pink", order: -1 },
                    { name: "Player 2", color: "yellow", order: 1 },
                ],
                victoryPoints: 20,
            };

            const result = validateGameConfig(config);
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes("Order must be between 0 and 3"))).toBe(true);
        });

        it("should reject order >= 4", () => {
            const config: GameConfig = {
                playerCount: 2,
                players: [
                    { name: "Player 1", color: "pink", order: 4 },
                    { name: "Player 2", color: "yellow", order: 1 },
                ],
                victoryPoints: 20,
            };

            const result = validateGameConfig(config);
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes("Order must be between 0 and 3"))).toBe(true);
        });

        it("should reject duplicate orders", () => {
            const config: GameConfig = {
                playerCount: 2,
                players: [
                    { name: "Player 1", color: "pink", order: 0 },
                    { name: "Player 2", color: "yellow", order: 0 },
                ],
                victoryPoints: 20,
            };

            const result = validateGameConfig(config);
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes("Order 0 is already used"))).toBe(true);
        });

        it("should accept valid orders", () => {
            const config: GameConfig = {
                playerCount: 4,
                players: [
                    { name: "Player 1", color: "pink", order: 0 },
                    { name: "Player 2", color: "yellow", order: 1 },
                    { name: "Player 3", color: "orange", order: 2 },
                    { name: "Player 4", color: "purple", order: 3 },
                ],
                victoryPoints: 20,
            };

            const result = validateGameConfig(config);
            expect(result.valid).toBe(true);
        });
    });

    describe("multiple validation errors", () => {
        it("should collect all validation errors", () => {
            const config: GameConfig = {
                playerCount: 1,
                players: [{ name: "", color: "red" as any, order: -1 }],
                victoryPoints: 0,
            };

            const result = validateGameConfig(config);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(1);
            expect(result.errors).toContain("Player count must be between 2 and 4");
            expect(result.errors.some((e) => e.includes("Name is required"))).toBe(true);
            expect(result.errors.some((e) => e.includes("Invalid color"))).toBe(true);
            expect(result.errors.some((e) => e.includes("Order must be between 0 and 3"))).toBe(true);
            expect(result.errors).toContain("Victory points must be a positive integer");
        });
    });
});
