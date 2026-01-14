// Re-export for convenience
export type { Position } from "./board";
export type { PlayerColor } from "./player";

// Game status states
export type GameStatus = "setup" | "playing" | "roundEnd" | "gameEnd";

// Score reason types
export type ScoreReason =
    | "row_completion" // Completed a row of 5
    | "completed_row_bonus" // Added to existing completed row
    | "tall_stack" // Placed on stack with 3+ pieces
    | "topple_penalty" // Caused a topple (-10)
    | "topple_bonus"; // Previous player bonus (+3)

// Dice roll result
export type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;

// Piece entity
export interface Piece {
    id: string;
    playerId: string;
    color: PlayerColor;
    placedAt: Date;
    roundNumber: number;
}

// Score event
export interface ScoreEvent {
    id: string;
    playerId: string;
    points: number;
    reason: ScoreReason;
    timestamp: Date;
    roundNumber: number;
    details?: string;
}

// Placement action
export interface Placement {
    row: number;
    col: number;
    pieceId: string;
    playerId: string;
    color: PlayerColor;
    timestamp: Date;
}

// Turn entity
export interface Turn {
    id: string;
    playerId: string;
    roundNumber: number;
    diceRoll: number;
    placement?: Placement;
    scoreEvents: ScoreEvent[];
    startedAt: Date;
    completedAt?: Date;
}

// Game log entry
export interface GameLogEntry {
    id: string;
    type: "score" | "placement" | "topple" | "round_start" | "round_end" | "dice_roll" | "game_end";
    message: string;
    playerId?: string;
    playerName?: string;
    points?: number;
    position?: Position;
    timestamp: Date;
    roundNumber: number;
}

// Game entity
import type { Board, Position } from "./board";
import type { Player, PlayerColor } from "./player";

export interface Game {
    id: string;
    status: GameStatus;
    players: Player[];
    currentPlayerIndex: number;
    roundNumber: number;
    victoryPoints: number;
    board: Board;
    diceRoll?: DiceRoll;
    toppleOccurred: boolean;
    topplePlayerId?: string;
    diceRolledInRound: boolean; // Track if dice were rolled in current round
    log: GameLogEntry[];
    createdAt: Date;
    updatedAt: Date;
}

// Game configuration for setup
export interface GameConfig {
    playerCount: number;
    players: PlayerConfig[];
    victoryPoints: number;
    soundEnabled?: boolean; // Optional for backward compatibility
}

export interface PlayerConfig {
    name: string;
    color: PlayerColor;
    color2?: PlayerColor;
    order: number;
}
