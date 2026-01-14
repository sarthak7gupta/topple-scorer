import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Volume2, VolumeX } from "lucide-react";
import { getSoundEnabled, setSoundEnabled as saveSoundEnabled } from "../../lib/utils/sound";

export function SoundToggle() {
    const { t } = useTranslation();
    const [soundEnabled, setSoundEnabled] = useState(() => getSoundEnabled());

    useEffect(() => {
        // Listen for changes from other components
        const handleStorageChange = () => {
            setSoundEnabled(getSoundEnabled());
        };
        const handleConfigChange = () => {
            setSoundEnabled(getSoundEnabled());
        };
        globalThis.addEventListener("storage", handleStorageChange);
        // Also listen for custom events for same-tab updates
        globalThis.addEventListener("soundSettingChanged", handleStorageChange);
        // Listen for config changes (when game config is saved)
        globalThis.addEventListener("gameConfigChanged", handleConfigChange);
        return () => {
            globalThis.removeEventListener("storage", handleStorageChange);
            globalThis.removeEventListener("soundSettingChanged", handleStorageChange);
            globalThis.removeEventListener("gameConfigChanged", handleConfigChange);
        };
    }, []);

    const handleToggle = () => {
        const newValue = !soundEnabled;
        setSoundEnabled(newValue); // Update local state
        saveSoundEnabled(newValue); // Update persistent storage
        // Dispatch custom event for same-tab updates
        globalThis.dispatchEvent(new Event("soundSettingChanged"));
    };

    return (
        <div className="space-y-2">
            <Label htmlFor="sound-toggle" className="flex items-center gap-2">
                {soundEnabled ? (
                    <Volume2 className="w-4 h-4" aria-hidden="true" />
                ) : (
                    <VolumeX className="w-4 h-4" aria-hidden="true" />
                )}
                <span>{t("settings.sound")}</span>
            </Label>
            <Button
                id="sound-toggle"
                variant="outline"
                size="sm"
                onClick={handleToggle}
                aria-label={soundEnabled ? t("settings.soundMute") : t("settings.soundUnmute")}
                className="w-full"
            >
                {soundEnabled ? (
                    <>
                        <Volume2 className="w-4 h-4 mr-2" aria-hidden="true" />
                        {t("settings.soundOn")}
                    </>
                ) : (
                    <>
                        <VolumeX className="w-4 h-4 mr-2" aria-hidden="true" />
                        {t("settings.soundOff")}
                    </>
                )}
            </Button>
        </div>
    );
}
