import { useTranslation } from "react-i18next";
import { useGameState } from "../../hooks/useGameState";
import { useSound } from "../../hooks/useSound";
import { getSoundEnabled } from "../../lib/utils/sound";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useState, useEffect, useRef, useMemo } from "react";
import { Settings } from "lucide-react";
import type { PlayerColor } from "../../lib/types/player";

// Dice face component that displays dots in the pattern of a real die
function DiceFace({ value, opacity = 1 }: Readonly<{ value: number; opacity?: number }>) {
    const dotPositions: Record<number, Array<{ row: number; col: number }>> = {
        1: [{ row: 2, col: 2 }],
        2: [
            { row: 1, col: 1 },
            { row: 3, col: 3 },
        ],
        3: [
            { row: 1, col: 1 },
            { row: 2, col: 2 },
            { row: 3, col: 3 },
        ],
        4: [
            { row: 1, col: 1 },
            { row: 1, col: 3 },
            { row: 3, col: 1 },
            { row: 3, col: 3 },
        ],
        5: [
            { row: 1, col: 1 },
            { row: 1, col: 3 },
            { row: 2, col: 2 },
            { row: 3, col: 1 },
            { row: 3, col: 3 },
        ],
        6: [
            { row: 1, col: 1 },
            { row: 1, col: 3 },
            { row: 2, col: 1 },
            { row: 2, col: 3 },
            { row: 3, col: 1 },
            { row: 3, col: 3 },
        ],
    };

    const dots = dotPositions[value] || [];

    return (
        <div
            className="flex items-center justify-center bg-white border-2 border-gray-800 rounded-xl shadow-lg p-3 transition-opacity duration-200"
            style={{
                opacity,
                width: "92px",
                height: "92px",
                flexShrink: 0,
            }}
            aria-label={`Dice showing ${value}`}
        >
            <div className="grid grid-cols-3 gap-1 w-16 h-16">
                {Array.from({ length: 9 }).map((_, index) => {
                    const row = Math.floor(index / 3) + 1;
                    const col = (index % 3) + 1;
                    const hasDot = dots.some((dot) => dot.row === row && dot.col === col);
                    return (
                        <div key={`dot-${row}-${col}`} className="flex items-center justify-center">
                            <div
                                className={`w-3 h-3 bg-gray-800 rounded-full transition-all duration-150 ease-in-out ${
                                    hasDot ? "opacity-100 scale-100" : "opacity-0 scale-75"
                                }`}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Slot machine style dice component with vertical scrolling animation
function SlotMachineDice({
    value,
    isRolling,
    opacity = 1,
}: Readonly<{ value: number; isRolling: boolean; opacity?: number }>) {
    // Dice face size: w-16 (64px) + h-16 (64px) + p-3 (12px each side = 24px) + border-2 (2px each side = 4px) = 92px
    const diceSize = 92;
    const [scrollPosition, setScrollPosition] = useState(0);
    const animationRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        if (isRolling) {
            // Start continuous scrolling animation (slot machine effect)
            startTimeRef.current = Date.now();
            const startPosition = Math.random() * diceSize * 6; // Random starting position
            setScrollPosition(startPosition);
            let isAnimating = true;

            const animate = () => {
                if (!isAnimating) return;

                const elapsed = Date.now() - (startTimeRef.current || 0);
                const speed = 0.8; // pixels per millisecond - faster scrolling
                const newPosition = startPosition + elapsed * speed;

                // Keep scrolling (will wrap around due to repeating dice strip)
                setScrollPosition(newPosition % (diceSize * 6));

                animationRef.current = requestAnimationFrame(animate);
            };

            animationRef.current = requestAnimationFrame(animate);

            return () => {
                isAnimating = false;
                if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current);
                }
            };
        } else if (value) {
            // Animation finished, smoothly settle on final value
            const targetPosition = (value - 1) * diceSize;
            setScrollPosition(targetPosition);
        }
    }, [isRolling, value, diceSize]);

    // Create a long strip of dice faces (1-6 repeated multiple times)
    const diceStrip = Array.from({ length: 24 }, (_, i) => (i % 6) + 1);

    return (
        <div
            className="relative overflow-hidden rounded-xl"
            style={{
                width: `${diceSize}px`,
                height: `${diceSize}px`,
                opacity,
            }}
            aria-label={`Dice showing ${value}`}
        >
            <div
                className="absolute top-0 left-0"
                style={{
                    transform: `translateY(-${scrollPosition}px)`,
                    transition: isRolling ? "none" : "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    willChange: isRolling ? "transform" : "auto",
                }}
            >
                {diceStrip.map((diceValue, index) => (
                    <div
                        key={`dice-${index}-${diceValue}`}
                        className="flex items-center justify-center"
                        style={{
                            height: `${diceSize}px`,
                            width: `${diceSize}px`,
                        }}
                    >
                        <DiceFace value={diceValue} opacity={1} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function DiceRoll() {
    const { t } = useTranslation();
    const { game, rollDice, currentPlayer, triggerTopple, selectedColor, setSelectedColor } = useGameState();
    const { playSound } = useSound();
    const [isRolling, setIsRolling] = useState(false);
    const [animatedValue, setAnimatedValue] = useState<number | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const previousDiceRollRef = useRef<number | null>(null);
    const isButtonRollRef = useRef<boolean>(false);
    const [showPlayerSelect, setShowPlayerSelect] = useState(false);
    const [selectedTopplePlayerId, setSelectedTopplePlayerId] = useState<string | null>(null);

    // Generate random number between 1 and 6
    const getRandomDiceValue = (): number => {
        return Math.floor(Math.random() * 6) + 1;
    };

    // Cleanup interval on unmount
    useEffect(() => {
        const currentInterval = intervalRef.current;
        return () => {
            if (currentInterval) {
                clearInterval(currentInterval);
            }
        };
    }, []);

    // Handle external dice rolls (e.g., from keyboard shortcuts)
    useEffect(() => {
        // If diceRoll changed from null/undefined to a value and we're not already rolling,
        // and it wasn't initiated by the button, it means the roll was triggered externally (e.g., keyboard shortcut)
        if (game?.diceRoll && previousDiceRollRef.current === null && !isRolling && !isButtonRollRef.current) {
            setIsRolling(true);

            // Play dice rolling sound effect (MP3 file)
            if (getSoundEnabled()) {
                const baseUrl = ((import.meta as any).env?.BASE_URL || "/topple-scorer/") as string;
                const diceAudio = new Audio(`${baseUrl}assets/dice.mp3`);
                diceAudio.play().catch((error) => {
                    console.warn("Failed to play dice sound:", error);
                });
            }

            // Set a random initial value for the slot machine animation
            setAnimatedValue(getRandomDiceValue());

            // After 1000ms, stop the rolling state
            setTimeout(() => {
                setIsRolling(false);
                // Play the completion sound after roll is done
                playSound("dice");
            }, 1000);
        }
        // Reset the button roll flag after the roll is processed
        if (game?.diceRoll && previousDiceRollRef.current === null) {
            isButtonRollRef.current = false;
        }
        // Update the ref to track the previous dice roll value
        previousDiceRollRef.current = game?.diceRoll || null;
    }, [game?.diceRoll, isRolling, playSound]);

    // Clear animated value when game.diceRoll is set (after animation completes)
    useEffect(() => {
        if (game?.diceRoll && animatedValue !== null && !isRolling) {
            setAnimatedValue(null);
        }
    }, [game?.diceRoll, animatedValue, isRolling]);

    // Find the last player who placed a piece (default to current player)
    const lastPlayerWhoPlacedPiece = useMemo(() => {
        if (!game?.log) return currentPlayer;
        // Find the last placement entry in the log
        const lastPlacement = [...game.log].reverse().find((entry) => entry.type === "placement");
        if (lastPlacement?.playerId) {
            return game.players.find((p) => p.id === lastPlacement.playerId) || currentPlayer;
        }
        return currentPlayer;
    }, [game?.log, game?.players, currentPlayer]);

    // Get the selected topple player (default to last player who placed a piece)
    const topplePlayer = useMemo(() => {
        if (selectedTopplePlayerId) {
            return game?.players.find((p) => p.id === selectedTopplePlayerId) || lastPlayerWhoPlacedPiece;
        }
        return lastPlayerWhoPlacedPiece;
    }, [selectedTopplePlayerId, game?.players, lastPlayerWhoPlacedPiece]);

    if (game?.status !== "playing") {
        return null;
    }

    // Allow rolling if there's a current player, even if not marked active
    // The reducer will handle activation if needed
    const canRoll = !game.diceRoll && currentPlayer && !isRolling;
    const canTopple = currentPlayer;

    const handleRoll = () => {
        if (!canRoll) return;
        setIsRolling(true);
        isButtonRollRef.current = true; // Mark that this roll was initiated by the button

        // Play dice rolling sound effect (MP3 file)
        const baseUrl = ((import.meta as any).env?.BASE_URL || "/topple-scorer/") as string;
        const diceAudio = new Audio(`${baseUrl}assets/dice.mp3`);
        diceAudio.play().catch((error) => {
            console.warn("Failed to play dice sound:", error);
        });

        // Set a random initial value for the slot machine animation
        // The slot machine will scroll and then settle on the final value
        setAnimatedValue(getRandomDiceValue());

        // After 1000ms, perform the actual roll
        setTimeout(() => {
            rollDice();
            setIsRolling(false);
            // Play the completion sound after roll is done
            playSound("dice");
            // animatedValue will be cleared by useEffect when game.diceRoll is set
        }, 1000);
    };

    const handleTopple = () => {
        if (!canTopple || !topplePlayer) return;
        playSound("topple");
        triggerTopple(topplePlayer.id);
        // Reset selection after topple
        setSelectedTopplePlayerId(null);
    };

    const handleOpenPlayerSelect = () => {
        setShowPlayerSelect(true);
    };

    const handleSelectPlayer = (playerId: string) => {
        setSelectedTopplePlayerId(playerId);
        setShowPlayerSelect(false);
    };

    // Check if 2-player mode
    const isTwoPlayerMode = currentPlayer?.color2 !== undefined;
    const availableColors: PlayerColor[] =
        isTwoPlayerMode && currentPlayer
            ? [currentPlayer.color, currentPlayer.color2].filter((c): c is PlayerColor => c !== undefined)
            : [];

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

    return (
        <Card className="w-full mx-auto" role="region" aria-label={t("dice.turnActions")}>
            <CardHeader>
                <CardTitle id="turn-actions-title">{t("dice.turnActions")}</CardTitle>
                <CardDescription id="turn-actions-description">
                    {currentPlayer
                        ? t("dice.playerTurn", {
                              playerName: currentPlayer.name,
                          })
                        : t("dice.waitingForPlayer")}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Color Selection for 2-Player Mode - Always visible when it's player's turn */}
                {isTwoPlayerMode && availableColors.length > 0 && currentPlayer && (
                    <div className="space-y-2 pb-4 border-b">
                        <Label htmlFor="color-select" className="text-sm font-semibold">
                            {t("dice.selectColor")}
                        </Label>
                        <Select
                            value={selectedColor || currentPlayer.color || ""}
                            onValueChange={(value) => {
                                const newColor = value as PlayerColor;
                                setSelectedColor(newColor);
                            }}
                        >
                            <SelectTrigger id="color-select" className="w-full">
                                <SelectValue>
                                    {(() => {
                                        const displayColor = selectedColor || currentPlayer.color;
                                        if (displayColor && displayColor in colorMap) {
                                            const colorInfo = colorMap[displayColor];
                                            return (
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={`w-4 h-4 rounded-full border-2 ${colorInfo.bg} ${colorInfo.border}`}
                                                    />
                                                    <span>{t(colorInfo.nameKey)}</span>
                                                </div>
                                            );
                                        }
                                        return t("dice.selectColor");
                                    })()}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {availableColors.map((color) => {
                                    const colorInfo = colorMap[color];
                                    const remaining = currentPlayer?.piecesRemainingByColor?.[color] ?? 0;
                                    const isDisabled = remaining === 0;
                                    return (
                                        <SelectItem key={color} value={color} disabled={isDisabled}>
                                            <div className="flex items-center justify-between gap-2 w-full">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={`w-4 h-4 rounded-full border-2 ${colorInfo.bg} ${colorInfo.border}`}
                                                    />
                                                    <span>{t(colorInfo.nameKey)}</span>
                                                </div>
                                                {isTwoPlayerMode && (
                                                    <span className="text-xs text-gray-500">
                                                        ({remaining} {t("dice.piecesRemaining")})
                                                    </span>
                                                )}
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Dice Roll Section */}
                <div className="space-y-2">
                    {game.diceRoll || animatedValue !== null || isRolling ? (
                        <div className="text-center space-y-3">
                            <div className="flex justify-center">
                                <SlotMachineDice
                                    value={(isRolling && animatedValue !== null ? animatedValue : game.diceRoll) || 1}
                                    isRolling={isRolling}
                                    opacity={isRolling ? 0.9 : 1}
                                />
                            </div>
                            {!isRolling && game.diceRoll && (
                                <div className="mt-2">
                                    <Badge className="text-sm border">
                                        {game.diceRoll === 1 && t("dice.placeCenterOnly")}
                                        {game.diceRoll >= 2 &&
                                            game.diceRoll <= 5 &&
                                            t("dice.placeOnLevel", {
                                                level: game.diceRoll,
                                            })}
                                        {game.diceRoll === 6 && t("dice.placeAnywhere")}
                                    </Badge>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center space-y-2">
                            <button
                                onClick={handleRoll}
                                disabled={!canRoll}
                                className={`
                  text-4xl transition-transform duration-200 hover:scale-110 active:scale-95
                  ${canRoll ? "cursor-pointer" : "cursor-not-allowed opacity-50"}
                `}
                                title={canRoll ? t("dice.clickToRollShortcut") : t("dice.cannotRoll")}
                                aria-label={canRoll ? t("dice.rollDice") : t("dice.cannotRoll")}
                                aria-describedby="turn-actions-description"
                            >
                                🎲
                            </button>
                            <Button
                                onClick={handleRoll}
                                disabled={!canRoll}
                                className="w-full text-lg py-6"
                                aria-label={canRoll ? t("dice.rollDice") : t("dice.cannotRoll")}
                            >
                                {t("dice.rollDice")}
                            </Button>
                            {!canRoll && (
                                <p className="text-sm text-gray-500">
                                    {currentPlayer ? t("game.waitingForTurn") : t("dice.noActivePlayer")}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Topple Section */}
                <div className="space-y-3 border-t pt-4">
                    <p className="text-sm font-semibold text-foreground mb-2">{t("topple.title")}</p>
                    <p className="text-sm text-muted-foreground mb-3">{t("topple.description")}</p>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2 p-2 bg-muted rounded-md">
                            <span className="text-sm text-muted-foreground">{t("topple.penaltyPlayer")}:</span>
                            <span className="text-sm font-semibold text-foreground">
                                {topplePlayer?.name || t("topple.noPlayer")}
                            </span>
                        </div>
                        <Button
                            onClick={handleOpenPlayerSelect}
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            aria-label={t("topple.selectPlayer")}
                            title={t("topple.selectPlayer")}
                        >
                            <Settings className="w-4 h-4" />
                        </Button>
                    </div>
                    <Button
                        onClick={handleTopple}
                        disabled={!canTopple || !topplePlayer}
                        variant="destructive"
                        className="w-full text-lg py-6"
                        aria-label={canTopple ? t("topple.ariaLabel") : t("topple.cannotMarkToppled")}
                        aria-describedby="turn-actions-description"
                    >
                        {canTopple ? <>{t("topple.button")}?</> : t("topple.cannotMarkToppled")}
                    </Button>
                    <p className="text-sm text-gray-500">{t("topple.message")}</p>
                </div>

                {/* Player Selection Dialog */}
                <Dialog open={showPlayerSelect} onOpenChange={setShowPlayerSelect}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t("topple.selectPlayerTitle")}</DialogTitle>
                            <DialogDescription>{t("topple.selectPlayerDescription")}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2 py-4">
                            {game?.players.map((player) => (
                                <Button
                                    key={player.id}
                                    variant={selectedTopplePlayerId === player.id ? "default" : "outline"}
                                    className="w-full justify-start"
                                    onClick={() => handleSelectPlayer(player.id)}
                                >
                                    {player.name}
                                    {player.id === lastPlayerWhoPlacedPiece?.id && (
                                        <Badge variant="secondary" className="ml-2">
                                            {t("topple.default")}
                                        </Badge>
                                    )}
                                </Button>
                            ))}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowPlayerSelect(false)} className="w-full">
                                {t("common.close")}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
