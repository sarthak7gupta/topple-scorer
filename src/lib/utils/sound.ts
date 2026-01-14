import { loadGameConfig, saveGameConfig } from "./storage";

// Legacy key for backward compatibility
const SOUND_ENABLED_KEY = "topple-sound-enabled";

export function getSoundEnabled(): boolean {
    try {
        // First try to get from game config
        const config = loadGameConfig();
        if (config?.soundEnabled !== undefined) {
            return config.soundEnabled;
        }
        // Fallback to legacy localStorage key for backward compatibility
        const saved = localStorage.getItem(SOUND_ENABLED_KEY);
        return saved !== "false"; // Default to true if not set
    } catch {
        return true;
    }
}

export function setSoundEnabled(enabled: boolean): void {
    try {
        // Save to game config
        const config = loadGameConfig();
        if (config) {
            const updatedConfig = {
                ...config,
                soundEnabled: enabled,
            };
            saveGameConfig(updatedConfig);
        } else {
            // If no config exists yet, save to legacy localStorage key
            // It will be saved to config when the game is started
            localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
        }
        // Dispatch event for same-tab updates
        globalThis.dispatchEvent(new Event("soundSettingChanged"));
    } catch (error) {
        console.error("Failed to save sound setting:", error);
    }
}
