import React from "react";

interface GameLayoutProps {
    children: React.ReactNode;
}

export function GameLayout({ children }: Readonly<GameLayoutProps>) {
    return (
        <div className="min-h-screen bg-board-bg">
            <div className="container mx-auto px-3 py-2">{children}</div>
        </div>
    );
}
