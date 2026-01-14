import { LanguageSelector } from "./LanguageSelector";
import { SoundToggle } from "./SoundToggle";

export function SettingsBar() {
    return (
        <div className="flex flex-row gap-3 items-start sm:items-start">
            <SoundToggle />
            <LanguageSelector />
        </div>
    );
}
