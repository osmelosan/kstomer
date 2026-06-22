import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { fr } from "./i18n/fr";
import { en } from "./i18n/en";
import { es } from "./i18n/es";

export const SUPPORTED_LANGUAGES = [
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        fr: { translation: fr },
        en: { translation: en },
        es: { translation: es },
      },
      fallbackLng: "fr",
      supportedLngs: ["fr", "en", "es"],
      interpolation: { escapeValue: false },
      detection: {
        order: ["localStorage", "navigator"],
        caches: ["localStorage"],
        lookupLocalStorage: "kstomer.lang",
      },
    });
}

export default i18n;
