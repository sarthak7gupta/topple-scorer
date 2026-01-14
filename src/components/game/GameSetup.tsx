import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useGameState } from "../../hooks/useGameState";
import { validateGameConfig } from "../../lib/game/validation";
import { loadGameConfig, saveGameConfig } from "../../lib/utils/storage";
import { getSoundEnabled } from "../../lib/utils/sound";
import type { GameConfig, PlayerConfig } from "../../lib/types/game";
import type { PlayerColor } from "../../lib/types/player";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { Tutorial } from "../tutorial/Tutorial";
import { HelpCircle } from "lucide-react";
import { SettingsBar } from "../settings/SettingsBar";

const PLAYER_COLORS: PlayerColor[] = ["pink", "yellow", "orange", "purple"];
// Note: Only pink, yellow, orange, and purple colors are currently supported

export function GameSetup() {
    const { t } = useTranslation();
    const { setupGame, game } = useGameState();

    const colorMap: Record<PlayerColor, { nameKey: string; bg: string; border: string }> = {
        pink: {
            nameKey: "setup.pink",
            bg: "bg-pink-piece",
            border: "border-pink-500",
        },
        yellow: {
            nameKey: "setup.yellow",
            bg: "bg-yellow-piece",
            border: "border-yellow-500",
        },
        orange: {
            nameKey: "setup.orange",
            bg: "bg-orange-piece",
            border: "border-orange-500",
        },
        purple: {
            nameKey: "setup.purple",
            bg: "bg-purple-piece",
            border: "border-purple-500",
        },
    };

    // Load saved configuration or use defaults
    const savedConfig = loadGameConfig();
    const [playerCount, setPlayerCount] = useState<number>(savedConfig?.playerCount || 3);
    const [victoryPoints, setVictoryPoints] = useState<number>(savedConfig?.victoryPoints || 100);
    const [players, setPlayers] = useState<PlayerConfig[]>(() => {
        if (savedConfig?.players && savedConfig.players.length > 0) {
            // Restore saved players, ensuring order is correct
            const sortedPlayers = savedConfig.players.slice().sort((a, b) => a.order - b.order);
            return sortedPlayers.map((p, i) => ({ ...p, order: i }));
        }
        // Default players
        return [
            {
                name: t("setup.playerDefault", { number: 1 }),
                color: "pink",
                order: 0,
            },
            {
                name: t("setup.playerDefault", { number: 2 }),
                color: "yellow",
                order: 1,
            },
            {
                name: t("setup.playerDefault", { number: 3 }),
                color: "orange",
                order: 2,
            },
        ];
    });
    const [errors, setErrors] = useState<string[]>([]);
    const [showTutorial, setShowTutorial] = useState(false);

    // Update players when player count changes
    useEffect(() => {
        const newPlayers: PlayerConfig[] = [];
        for (let i = 0; i < playerCount; i++) {
            if (players[i]) {
                newPlayers.push(players[i]);
            } else {
                const defaultColors: PlayerColor[] = ["pink", "yellow", "orange", "purple"];
                newPlayers.push({
                    name: t("setup.playerDefault", { number: i + 1 }),
                    color: defaultColors[i] || "pink",
                    order: i,
                });
            }
        }
        setPlayers(newPlayers);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playerCount]);

    const handlePlayerNameChange = (index: number, name: string) => {
        const newPlayers = [...players];
        newPlayers[index] = { ...newPlayers[index], name };
        setPlayers(newPlayers);
    };

    const handlePlayerColorChange = (index: number, color: PlayerColor) => {
        const newPlayers = [...players];
        const player = newPlayers[index];

        if (playerCount === 2) {
            // In 2-player mode, automatically assign the remaining color as color2
            if (player.color2 === color) {
                // If selecting the same color as color2, clear color2
                newPlayers[index] = { ...player, color, color2: undefined };
            } else {
                // Find the remaining available color
                const usedColors = new Set<PlayerColor>();
                newPlayers.forEach((p, i) => {
                    if (i !== index) {
                        if (p.color) usedColors.add(p.color);
                        if (p.color2) usedColors.add(p.color2);
                    }
                });
                usedColors.add(color); // Add the newly selected color

                // Find the color that's not used
                const availableColor = PLAYER_COLORS.find((c) => !usedColors.has(c));
                if (availableColor) {
                    newPlayers[index] = { ...player, color, color2: availableColor };

                    // Update the other player's color2 if needed to ensure uniqueness
                    const otherPlayerIndex = index === 0 ? 1 : 0;
                    const otherPlayer = newPlayers[otherPlayerIndex];
                    if (otherPlayer?.color2 === availableColor) {
                        // If the other player's color2 conflicts, find a new available color for them
                        const otherUsedColors = new Set<PlayerColor>();
                        otherUsedColors.add(otherPlayer.color);
                        otherUsedColors.add(color);
                        otherUsedColors.add(availableColor);
                        const otherAvailableColor = PLAYER_COLORS.find((c) => !otherUsedColors.has(c));
                        if (otherAvailableColor) {
                            newPlayers[otherPlayerIndex] = { ...otherPlayer, color2: otherAvailableColor };
                        }
                    }
                } else {
                    newPlayers[index] = { ...player, color };
                }
            }
        } else {
            newPlayers[index] = { ...player, color };
        }
        setPlayers(newPlayers);
    };

    const handlePlayerColor2Change = (index: number, color2: PlayerColor | undefined) => {
        const newPlayers = [...players];
        const player = newPlayers[index];
        // In 2-player mode, if color2 conflicts with the player's own color, prevent the change
        if (playerCount === 2 && color2 && player.color === color2) {
            return; // Don't allow setting color2 to the same as color
        }
        newPlayers[index] = { ...player, color2 };
        setPlayers(newPlayers);
    };

    const handleMovePlayer = (index: number, direction: "up" | "down") => {
        if (direction === "up" && index === 0) return;
        if (direction === "down" && index === players.length - 1) return;

        const newPlayers = [...players];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        const temp = newPlayers[index];
        newPlayers[index] = { ...newPlayers[targetIndex], order: index };
        newPlayers[targetIndex] = { ...temp, order: targetIndex };
        setPlayers(newPlayers);
    };

    const handleStartGame = () => {
        const config: GameConfig = {
            playerCount,
            players: players.map((p, i) => ({ ...p, order: i })),
            victoryPoints,
            soundEnabled: getSoundEnabled(), // Save current sound setting
        };

        const validation = validateGameConfig(config);
        if (!validation.valid) {
            setErrors(validation.errors);
            return;
        }

        setErrors([]);
        // Save configuration for next time
        saveGameConfig(config);
        setupGame(config);
    };

    // Don't show setup if game is already started
    if (game && game.status !== "setup") {
        return null;
    }

    return (
        <>
            {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}
            <div className="flex justify-end mb-2">
                <SettingsBar />
            </div>
            <Card className="max-w-2xl mx-auto" role="main" aria-label="Game setup">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle id="setup-title">{t("setup.title")}</CardTitle>
                            <CardDescription id="setup-description">{t("setup.description")}</CardDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowTutorial(true)}
                            title="Show tutorial"
                            aria-label="Show interactive tutorial"
                        >
                            <HelpCircle className="w-5 h-5" aria-hidden="true" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Player Count */}
                    <div className="space-y-2">
                        <Label id="playerCount-label" htmlFor="playerCount">
                            {t("setup.playerCount")}
                        </Label>
                        <Select
                            value={playerCount.toString()}
                            onValueChange={(value) => setPlayerCount(Number.parseInt(value, 10))}
                        >
                            <SelectTrigger id="playerCount" aria-labelledby="playerCount-label">
                                <SelectValue aria-label={`${playerCount} players selected`} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2">2 Players</SelectItem>
                                <SelectItem value="3">3 Players</SelectItem>
                                <SelectItem value="4">4 Players</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Victory Points */}
                    <div className="space-y-2">
                        <Label id="victoryPoints-label" htmlFor="victoryPoints">
                            {t("setup.victoryPoints")}
                        </Label>
                        <Input
                            id="victoryPoints"
                            type="number"
                            min="1"
                            value={victoryPoints}
                            onChange={(e) => setVictoryPoints(Number.parseInt(e.target.value, 10) || 100)}
                            aria-labelledby="victoryPoints-label"
                            aria-describedby="victory-points-description"
                        />
                        <p id="victory-points-description" className="text-xs text-gray-500 sr-only">
                            Enter the number of points required to win the game
                        </p>
                    </div>

                    {/* Players Configuration */}
                    <div className="space-y-4">
                        <Label>{t("setup.players")}</Label>
                        {players.map((player, index) => (
                            <Card key={`player-${index}-${player.order}`} className="p-4">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-lg font-semibold">
                                            {t("setup.player", {
                                                number: index + 1,
                                            })}
                                        </Label>
                                        <div className="flex gap-2">
                                            <Button
                                                className="border"
                                                onClick={() => handleMovePlayer(index, "up")}
                                                disabled={index === 0}
                                                aria-label={`Move player ${index + 1} up in order`}
                                                title="Move player up"
                                            >
                                                <span aria-hidden="true">↑</span>
                                            </Button>
                                            <Button
                                                className="border"
                                                onClick={() => handleMovePlayer(index, "down")}
                                                disabled={index === players.length - 1}
                                                aria-label={`Move player ${index + 1} down in order`}
                                                title="Move player down"
                                            >
                                                <span aria-hidden="true">↓</span>
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor={`player-${index}-name`}>{t("setup.name")}</Label>
                                        <Input
                                            id={`player-${index}-name`}
                                            value={player.name}
                                            onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor={`player-${index}-color`}>{t("setup.color")}</Label>
                                        <Select
                                            value={player.color}
                                            onValueChange={(value) =>
                                                handlePlayerColorChange(index, value as PlayerColor)
                                            }
                                        >
                                            <SelectTrigger
                                                id={`player-${index}-color`}
                                                aria-label={`Player ${index + 1} primary color`}
                                            >
                                                <SelectValue
                                                    aria-label={
                                                        player.color
                                                            ? `${t(colorMap[player.color].nameKey)} color selected`
                                                            : t("setup.noColorSelected")
                                                    }
                                                >
                                                    {player.color && (
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className={`w-4 h-4 rounded-full border-2 ${colorMap[player.color].bg} ${colorMap[player.color].border}`}
                                                                aria-hidden="true"
                                                            />
                                                            <span>{t(colorMap[player.color].nameKey)}</span>
                                                        </div>
                                                    )}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PLAYER_COLORS.map((color) => {
                                                    const colorInfo = colorMap[color];
                                                    // In 2-player mode, ensure all colors are unique across all players
                                                    // In other modes, only primary colors need to be unique
                                                    const isDisabled =
                                                        playerCount === 2
                                                            ? players.some(
                                                                  (p, i) =>
                                                                      i !== index &&
                                                                      (p.color === color || p.color2 === color)
                                                              ) || color === player.color2
                                                            : players.some((p, i) => i !== index && p.color === color);
                                                    return (
                                                        <SelectItem key={color} value={color} disabled={isDisabled}>
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className={`w-4 h-4 rounded-full border-2 ${colorInfo.bg} ${colorInfo.border}`}
                                                                />
                                                                <span>{t(colorInfo.nameKey)}</span>
                                                            </div>
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Second color for 2-player mode */}
                                    {playerCount === 2 && (
                                        <div className="space-y-2">
                                            <Label htmlFor={`player-${index}-color2`}>{t("setup.color2")}</Label>
                                            <Select
                                                value={player.color2 || "none"}
                                                onValueChange={(value) =>
                                                    handlePlayerColor2Change(
                                                        index,
                                                        value === "none" ? undefined : (value as PlayerColor)
                                                    )
                                                }
                                            >
                                                <SelectTrigger id={`player-${index}-color2`}>
                                                    <SelectValue placeholder="Select second color">
                                                        {player.color2 ? (
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className={`w-4 h-4 rounded-full border-2 ${colorMap[player.color2].bg} ${colorMap[player.color2].border}`}
                                                                />
                                                                <span>{t(colorMap[player.color2].nameKey)}</span>
                                                            </div>
                                                        ) : (
                                                            "Select second color"
                                                        )}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-4 h-4 rounded-full border-2 border-gray-300 bg-gray-100" />
                                                            <span>{t("setup.none")}</span>
                                                        </div>
                                                    </SelectItem>
                                                    {PLAYER_COLORS.filter(
                                                        (color) =>
                                                            color !== player.color &&
                                                            !players.some(
                                                                (p, i) =>
                                                                    i !== index &&
                                                                    (p.color === color || p.color2 === color)
                                                            )
                                                    ).map((color) => {
                                                        const colorInfo = colorMap[color];
                                                        return (
                                                            <SelectItem key={color} value={color}>
                                                                <div className="flex items-center gap-2">
                                                                    <div
                                                                        className={`w-4 h-4 rounded-full border-2 ${colorInfo.bg} ${colorInfo.border}`}
                                                                    />
                                                                    <span>{t(colorInfo.nameKey)}</span>
                                                                </div>
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Errors */}
                    {errors.length > 0 && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                            <ul className="list-disc list-inside text-sm text-red-800">
                                {errors.map((error) => (
                                    <li key={typeof error === "string" ? error : JSON.stringify(error)}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Start Game Button */}
                    <Button onClick={handleStartGame} className="w-full text-lg py-6">
                        {t("setup.startGame")}
                    </Button>
                </CardContent>
            </Card>
        </>
    );
}
