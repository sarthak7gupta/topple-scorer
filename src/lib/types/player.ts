// Player color options
export type PlayerColor = "pink" | "yellow" | "orange" | "purple";

// Player entity
export interface Player {
    id: string;
    name: string;
    color: PlayerColor;
    color2?: PlayerColor; // For 2-player mode
    score: number; // Total score (sum of all color scores in 2-player mode)
    scoreByColor?: Record<PlayerColor, number>; // For 2-player mode: tracks score per color
    piecesRemaining: number;
    piecesRemainingByColor?: Record<PlayerColor, number>; // For 2-player mode: tracks pieces per color
    totalPieces: number;
    order: number;
    isActive: boolean;
}
