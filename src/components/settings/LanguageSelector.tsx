import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Globe } from "lucide-react";

const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
];

export function LanguageSelector() {
    const { i18n, t } = useTranslation();

    const handleLanguageChange = (langCode: string) => {
        i18n.changeLanguage(langCode);
        localStorage.setItem("topple-language", langCode);
    };

    const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

    return (
        <div className="space-y-2">
            <Label htmlFor="language-select" className="flex items-center gap-2">
                <Globe className="w-4 h-4" aria-hidden="true" />
                <span>{t("language.selectLanguage")}</span>
            </Label>
            <Select value={i18n.language} onValueChange={handleLanguageChange}>
                <SelectTrigger
                    id="language-select"
                    className="w-full text-foreground"
                    aria-label={t("language.selectLanguage")}
                >
                    <SelectValue aria-label={`${currentLanguage.name} selected`} className="text-foreground">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{currentLanguage.flag}</span>
                            <span>{currentLanguage.name}</span>
                        </div>
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{lang.flag}</span>
                                <span>{lang.name}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
