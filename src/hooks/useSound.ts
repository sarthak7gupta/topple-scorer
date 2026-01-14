import { useEffect, useRef, useState } from "react";
import { getSoundEnabled } from "../lib/utils/sound";

type SoundType = "dice" | "place" | "score" | "topple" | "error";

/**
 * Custom hook for playing sound effects
 * Uses Web Audio API to generate sounds programmatically
 * Respects global sound setting from localStorage
 */
export function useSound() {
    const audioContextRef = useRef<AudioContext | null>(null);
    const [soundEnabled, setSoundEnabled] = useState(getSoundEnabled);

    // Listen for sound setting changes
    useEffect(() => {
        const handleSoundSettingChange = () => {
            setSoundEnabled(getSoundEnabled());
        };
        globalThis.addEventListener("soundSettingChanged", handleSoundSettingChange);
        globalThis.addEventListener("storage", handleSoundSettingChange);
        return () => {
            globalThis.removeEventListener("soundSettingChanged", handleSoundSettingChange);
            globalThis.removeEventListener("storage", handleSoundSettingChange);
        };
    }, []);

    useEffect(() => {
        if (soundEnabled && !audioContextRef.current) {
            try {
                audioContextRef.current = new (globalThis.AudioContext || (globalThis as any).webkitAudioContext)();
            } catch (error) {
                console.warn("Failed to create AudioContext:", error);
                audioContextRef.current = null;
            }
        }

        return () => {
            if (audioContextRef.current) {
                const ctx = audioContextRef.current;
                // Try to close the context, but ignore errors if it's already closed
                ctx.close().catch(() => {
                    // Ignore errors - context might already be closed or closing
                });
                audioContextRef.current = null;
            }
        };
    }, [soundEnabled]);

    const playSound = (type: SoundType) => {
        if (!soundEnabled || !audioContextRef.current) return;

        const ctx = audioContextRef.current;

        // Check if the context is suspended and try to resume
        if (ctx.state === "suspended" || ctx.state === "interrupted") {
            ctx.resume().catch((error) => {
                console.warn("Failed to resume AudioContext:", error);
            });
        }

        try {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            // Different sounds for different events
            switch (type) {
                case "dice":
                    oscillator.type = "sine";
                    oscillator.frequency.value = 440;
                    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
                    oscillator.start(ctx.currentTime);
                    oscillator.stop(ctx.currentTime + 0.2);
                    break;

                case "place":
                    oscillator.type = "sine";
                    oscillator.frequency.value = 330;
                    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
                    oscillator.start(ctx.currentTime);
                    oscillator.stop(ctx.currentTime + 0.15);
                    break;

                case "score":
                    // Pleasant chime for scoring
                    oscillator.type = "sine";
                    oscillator.frequency.value = 523.25; // C5
                    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                    oscillator.start(ctx.currentTime);
                    oscillator.stop(ctx.currentTime + 0.3);
                    break;

                case "topple":
                    // Lower, more dramatic sound
                    oscillator.type = "sawtooth";
                    oscillator.frequency.value = 220;
                    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                    oscillator.start(ctx.currentTime);
                    oscillator.stop(ctx.currentTime + 0.4);
                    break;

                case "error":
                    // Short beep
                    oscillator.type = "square";
                    oscillator.frequency.value = 200;
                    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
                    oscillator.start(ctx.currentTime);
                    oscillator.stop(ctx.currentTime + 0.1);
                    break;
            }
        } catch (error) {
            console.warn("Error playing sound:", error);
            // If context throws an error, it might be invalid - reset it
            try {
                if (ctx.state === "suspended" || ctx.state === "interrupted") {
                    // Context is still valid, just not running
                } else {
                    // Context might be invalid, reset it
                    audioContextRef.current = null;
                }
            } catch {
                // Context is definitely invalid, reset it
                audioContextRef.current = null;
            }
        }
    };

    return { playSound };
}
