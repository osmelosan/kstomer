import type { LanguageCode } from "./i18n";

const LANG_STORAGE_KEY = "kstomer.lang";

function countryToLanguage(countryCode: string): LanguageCode {
  const country = countryCode.toUpperCase();
  if (country === "FR") return "fr";
  if (country === "ES") return "es";
  return "en";
}

export async function detectLanguageFromIp(): Promise<LanguageCode | null> {
  if (typeof localStorage === "undefined") return null;
  if (localStorage.getItem(LANG_STORAGE_KEY)) return null;

  try {
    // Cloudflare injects loc= into /cdn-cgi/trace for all CF-hosted apps
    const res = await fetch("/cdn-cgi/trace");
    if (!res.ok) return null;
    const text = await res.text();
    const match = text.match(/loc=([A-Z]{2})/);
    if (match) return countryToLanguage(match[1]);
  } catch {
    // network failure or non-CF environment — fall back silently
  }
  return null;
}
