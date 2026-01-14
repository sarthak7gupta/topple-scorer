import type { Piece } from "../../lib/types/game";
import type { PlayerColor } from "../../lib/types/player";

interface PieceStackProps {
    pieces: Piece[];
    level: number;
}

const colorClasses: Record<PlayerColor, string> = {
    pink: "bg-pink-piece border-pink-500",
    yellow: "bg-yellow-piece border-yellow-500",
    orange: "bg-orange-piece border-orange-500",
    purple: "bg-purple-piece border-purple-500",
};

const levelBgClasses: Record<number, string> = {
    1: "bg-cell-level-1",
    2: "bg-cell-level-2",
    3: "bg-cell-level-3",
    4: "bg-cell-level-4",
    5: "bg-cell-level-5",
};

export function PieceStack({ pieces, level }: Readonly<PieceStackProps>) {
    const stackHeight = pieces.length;
    const baseBgClass = levelBgClasses[level] || "bg-gray-100";

    return (
        <div
            className={`relative w-full h-full ${baseBgClass} rounded-md border-2 border-gray-300 flex items-center justify-center`}
        >
            {/* Level indicator */}
            <div className="absolute top-1 left-1 text-xs font-semibold text-gray-600">L{level}</div>

            {/* Stack of pieces */}
            <div className="relative w-16 h-16 flex items-center justify-center">
                {pieces.map((piece, index) => {
                    const zIndex = index + 1;
                    // Show more of each lower piece - smaller offset between pieces
                    const offset = index * 3; // Increased from 2 to 3 for better visibility
                    const sizeReduction = index * 1.5; // Smaller size reduction so lower pieces are more visible
                    const colorClass = piece.color in colorClasses ? colorClasses[piece.color] : "bg-gray-400";

                    // Get the actual color value for solid fill
                    const colorMap: Record<PlayerColor, string> = {
                        pink: "#FF69B4",
                        yellow: "#FFD700",
                        orange: "#FF8C00",
                        purple: "#9370DB",
                    };
                    const backgroundColor = colorMap[piece.color] || "#9CA3AF";

                    return (
                        <div
                            key={piece.id}
                            className={`absolute ${colorClass} rounded-full border-2 border-opacity-80 shadow-md`}
                            style={{
                                width: `${36 - sizeReduction}px`,
                                height: `${36 - sizeReduction}px`,
                                zIndex,
                                bottom: `${offset}px`,
                                left: "50%",
                                transform: "translateX(-50%)",
                                backgroundColor, // Explicit solid background color
                            }}
                            title={`${piece.color} piece`}
                        />
                    );
                })}
            </div>

            {/* Stack height indicator - only show if stack has pieces */}
            {stackHeight > 0 && (
                <div className="absolute bottom-1 right-1 text-xs font-semibold text-gray-700 bg-white/80 px-1 rounded">
                    {stackHeight}
                </div>
            )}
        </div>
    );
}
