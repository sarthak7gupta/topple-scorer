import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import de from "./locales/de.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";

const resources = {
    en: { translation: en },
    es: { translation: es },
    fr: { translation: fr },
    de: { translation: de },
};

// Get saved language from localStorage or detect from browser
const getInitialLanguage = (): string => {
    const saved = localStorage.getItem("topple-language");
    if (saved && resources[saved as keyof typeof resources]) {
        return saved;
    }

    // Try to detect from browser
    const browserLang = navigator.language.split("-")[0];
    if (resources[browserLang as keyof typeof resources]) {
        return browserLang;
    }

    return "en"; // Default to English
};

i18n.use(initReactI18next).init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: "en",
    interpolation: {
        escapeValue: false, // React already escapes values
    },
    react: {
        useSuspense: false, // Disable suspense for better compatibility
    },
});

export { default } from "i18next";
