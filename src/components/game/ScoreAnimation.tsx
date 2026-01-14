import { useEffect, useState } from "react";
import { useSound } from "../../hooks/useSound";

interface ScoreAnimationProps {
    points: number;
    onComplete: () => void;
}

export function ScoreAnimation({ points, onComplete }: Readonly<ScoreAnimationProps>) {
    const { playSound } = useSound();
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (points !== 0) {
            playSound(points > 0 ? "score" : "error");
        }
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onComplete, 300);
        }, 1500);
        return () => clearTimeout(timer);
    }, [points, playSound, onComplete]);

    if (!visible) return null;

    return (
        <output
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
            aria-live="polite"
            aria-atomic="true"
        >
            <div
                className={`animate-score-popup text-6xl font-bold ${points > 0 ? "text-green-500" : "text-red-500"}`}
                aria-label={`${points > 0 ? "Gained" : "Lost"} ${Math.abs(points)} points`}
            >
                {points > 0 ? "+" : ""}
                {points}
            </div>
        </output>
    );
}
