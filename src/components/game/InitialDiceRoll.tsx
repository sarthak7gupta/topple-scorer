import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useGameState } from "../../hooks/useGameState";
import { rollDice } from "../../lib/utils/dice";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { GripVertical } from "lucide-react";
import { SettingsBar } from "../settings/SettingsBar";
import { getSoundEnabled } from "../../lib/utils/sound";

interface PlayerRoll {
    playerId: string;
    playerName: string;
    roll?: number;
}

export function InitialDiceRoll() {
    const { t } = useTranslation();
    const { game, dispatch } = useGameState();
    const [playerRolls, setPlayerRolls] = useState<PlayerRoll[]>([]);
    const [allRolled, setAllRolled] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);

    // Initialize player rolls if not done
    useEffect(() => {
        if (game?.status !== "playing" || game.roundNumber !== 1 || game.currentPlayerIndex !== 0) {
            return;
        }
        if (playerRolls.length === 0 && game.players.length > 0) {
            setPlayerRolls(
                game.players.map((p) => ({
                    playerId: p.id,
                    playerName: p.name,
                }))
            );
            setSelectedIndex(0);
        }
    }, [game, playerRolls.length]);

    if (game?.status !== "playing" || game.roundNumber !== 1 || game.currentPlayerIndex !== 0) {
        return null;
    }

    const handleRollForAllPlayers = () => {
        // Play dice rolling sound effect (MP3 file)
        if (getSoundEnabled()) {
            const baseUrl = ((import.meta as any).env?.BASE_URL || "/topple-scorer/") as string;
            const diceAudio = new Audio(`${baseUrl}assets/dice.mp3`);
            diceAudio.play().catch((error) => {
                console.warn("Failed to play dice sound:", error);
            });
        }

        // Roll dice for all players who haven't rolled yet
        const newRolls = playerRolls.map((playerRoll) => {
            if (playerRoll.roll === undefined) {
                return { ...playerRoll, roll: rollDice() };
            }
            return playerRoll;
        });

        setPlayerRolls(newRolls);

        // Check if all players have rolled
        if (newRolls.every((r) => r.roll !== undefined)) {
            setAllRolled(true);
        }
    };

    // Handle reorder via up/down buttons or select option movement
    const reorderPlayers = (from: number, to: number) => {
        if (from < 0 || to < 0 || from === to || from >= playerRolls.length || to >= playerRolls.length) {
            return;
        }

        const updated = [...playerRolls];
        const [moved] = updated.splice(from, 1);
        updated.splice(to, 0, moved);
        setPlayerRolls(updated);
        setSelectedIndex(to);
    };

    // Handle <select> keyboard move (Up/Down arrow reordering)
    const handleMoveKey = (e: React.KeyboardEvent<HTMLSelectElement>) => {
        if (allRolled) return;
        if (e.key === "ArrowUp" || e.key === "Up") {
            e.preventDefault();
            if (selectedIndex > 0) {
                reorderPlayers(selectedIndex, selectedIndex - 1);
            }
        } else if (e.key === "ArrowDown" || e.key === "Down") {
            e.preventDefault();
            if (selectedIndex < playerRolls.length - 1) {
                reorderPlayers(selectedIndex, selectedIndex + 1);
            }
        }
    };

    // Use a <select size={n}> to show the order and allow reordering
    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const idx = Number(e.target.value);
        setSelectedIndex(idx);
    };

    const handleMoveUp = () => {
        if (selectedIndex > 0) {
            reorderPlayers(selectedIndex, selectedIndex - 1);
        }
    };

    const handleMoveDown = () => {
        if (selectedIndex < playerRolls.length - 1) {
            reorderPlayers(selectedIndex, selectedIndex + 1);
        }
    };

    const handleDetermineWinner = () => {
        if (!allRolled) return;

        const maxRoll = Math.max(...playerRolls.map((r) => r.roll || 0));
        const winners = playerRolls.filter((r) => r.roll === maxRoll);

        // Get the new player order from playerRolls
        const playerOrder = playerRolls.map((pr) => pr.playerId);

        if (winners.length === 1) {
            // Single winner - set as starting player
            dispatch({
                type: "INITIAL_DICE_ROLL",
                payload: {
                    rolls: playerRolls.map((r) => ({
                        playerId: r.playerId,
                        roll: r.roll || 0,
                    })),
                    playerOrder, // Include the reordered player IDs
                },
            });
        } else {
            // Tie - need to roll again, but preserve the order
            setPlayerRolls(
                winners.map((w) => ({
                    playerId: w.playerId,
                    playerName: game.players.find((p) => p.id === w.playerId)?.name || "",
                }))
            );
            setAllRolled(false);
            // Still update player order even if there's a tie
            dispatch({
                type: "INITIAL_DICE_ROLL",
                payload: {
                    rolls: [],
                    playerOrder,
                },
            });
        }
    };

    return (
        <>
            <div className="flex justify-end mb-2">
                <SettingsBar />
            </div>
            <Card className="max-w-2xl mx-auto" role="region" aria-label={t("initialRoll.title")}>
                <CardHeader>
                    <CardTitle id="initial-roll-title">{t("initialRoll.title")}</CardTitle>
                    <CardDescription id="initial-roll-description">{t("initialRoll.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!allRolled && (
                        <p className="text-sm text-muted-foreground text-center text-gray-500">
                            {t("initialRoll.dragToReorder")}
                        </p>
                    )}
                    <div>
                        <label htmlFor="player-order-select" className="block text-sm font-medium mb-2">
                            {t("initialRoll.reorderList")}
                        </label>
                        <select
                            id="player-order-select"
                            size={Math.min(6, playerRolls.length) || 1}
                            value={selectedIndex}
                            aria-label={t("initialRoll.reorderList")}
                            aria-disabled={allRolled}
                            disabled={allRolled}
                            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-primary text-lg"
                            onChange={handleSelect}
                            onKeyDown={handleMoveKey}
                        >
                            {playerRolls.map((playerRoll, index) => (
                                <option
                                    key={playerRoll.playerId}
                                    value={index}
                                    aria-selected={selectedIndex === index}
                                >
                                    {playerRoll.playerName}{" "}
                                    {playerRoll.roll === undefined
                                        ? `(${t("initialRoll.waitingToRoll")})`
                                        : `(${t("initialRoll.rolledLabel", { roll: playerRoll.roll })})`}
                                </option>
                            ))}
                        </select>
                        {!allRolled && (
                            <div className="flex gap-2 justify-center mt-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    aria-label={t("initialRoll.moveUp")}
                                    disabled={selectedIndex === 0}
                                    onClick={handleMoveUp}
                                >
                                    <span aria-hidden="true">↑</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    aria-label={t("initialRoll.moveDown")}
                                    disabled={selectedIndex === playerRolls.length - 1}
                                    onClick={handleMoveDown}
                                >
                                    <span aria-hidden="true">↓</span>
                                </Button>
                            </div>
                        )}
                        <ul className="mt-4 space-y-2" aria-hidden="true">
                            {playerRolls.map((playerRoll, index) => (
                                <li
                                    key={playerRoll.playerId}
                                    className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                                        selectedIndex === index ? "ring-2 ring-primary" : ""
                                    } bg-white`}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        {!allRolled && (
                                            <GripVertical
                                                className="w-5 h-5 text-gray-400"
                                                aria-hidden="true"
                                                style={{ cursor: "grab" }}
                                            />
                                        )}
                                        <span className="font-semibold">{playerRoll.playerName}</span>
                                        {playerRoll.roll === undefined ? (
                                            <span className="text-sm text-gray-500">
                                                {t("initialRoll.waitingToRoll")}
                                            </span>
                                        ) : (
                                            <Badge
                                                className="text-lg px-3 py-1 border"
                                                aria-label={t("initialRoll.rolled", {
                                                    playerName: playerRoll.playerName,
                                                    roll: playerRoll.roll,
                                                })}
                                            >
                                                {playerRoll.roll}
                                            </Badge>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {!allRolled && (
                        <Button
                            onClick={handleRollForAllPlayers}
                            className="w-full text-lg py-6"
                            aria-label={t("initialRoll.rollForAll")}
                            aria-describedby="initial-roll-description"
                        >
                            {t("initialRoll.rollForAll")}
                        </Button>
                    )}

                    {allRolled && (
                        <Button
                            onClick={handleDetermineWinner}
                            className="w-full text-lg py-6"
                            aria-label={t("initialRoll.determineWinner")}
                            aria-describedby="initial-roll-description"
                        >
                            {t("initialRoll.determineWinner")}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
