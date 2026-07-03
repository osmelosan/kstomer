import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { fr } from "./i18n/fr";
import { en } from "./i18n/en";
import { es } from "./i18n/es";

export const SUPPORTED_LANGUAGES = [
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export const LANG_STORAGE_KEY = "kstomer.lang";

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        fr: { translation: fr },
        en: { translation: en },
        es: { translation: es },
      },
      // Deterministic on both server and the client's first paint — the
      // browser's/user's actual preference is applied client-side after
      // mount (see detectPreferredLanguage), never at init time. Detecting
      // synchronously here (as i18next-browser-languagedetector used to)
      // makes the client's very first render disagree with the
      // server-rendered HTML and trips a React hydration error.
      lng: "fr",
      fallbackLng: "fr",
      supportedLngs: ["fr", "en", "es"],
      interpolation: { escapeValue: false },
    });

  if (typeof window !== "undefined") {
    i18n.on("languageChanged", (lng) => {
      try {
        window.localStorage.setItem(LANG_STORAGE_KEY, lng);
      } catch {
        /* noop */
      }
    });
  }
}

/** Client-only: saved preference, else browser language, else null. */
export function detectPreferredLanguage(): LanguageCode | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      return saved as LanguageCode;
    }
  } catch {
    /* noop */
  }
  const nav = typeof navigator !== "undefined" ? navigator.language : undefined;
  const code = nav?.split("-")[0];
  return code && SUPPORTED_LANGUAGES.some((l) => l.code === code)
    ? (code as LanguageCode)
    : null;
}

export default i18n;
