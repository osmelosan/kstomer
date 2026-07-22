// Static ISO-3166-1 / E.164 country-calling-code table used by PhoneInput and
// the CSV contact importer. minLen/maxLen are the expected digit count of the
// national number (without the dial code) for a curated set of common
// countries; countries without explicit data fall back to DEFAULT_MIN_LEN /
// DEFAULT_MAX_LEN. This is a pragmatic length check, not a full telecom
// numbering-plan library.
export type PhoneCountry = {
  iso2: string;
  name: string;
  dialCode: string;
  minLen?: number;
  maxLen?: number;
};

export const DEFAULT_COUNTRY_ISO2 = "ES";
const DEFAULT_MIN_LEN = 7;
const DEFAULT_MAX_LEN = 12;

export const PHONE_COUNTRIES: PhoneCountry[] = [
  { iso2: "ES", name: "España", dialCode: "34", minLen: 9, maxLen: 9 },
  { iso2: "PT", name: "Portugal", dialCode: "351", minLen: 9, maxLen: 9 },
  { iso2: "FR", name: "Francia", dialCode: "33", minLen: 9, maxLen: 9 },
  { iso2: "DE", name: "Alemania", dialCode: "49", minLen: 10, maxLen: 11 },
  { iso2: "IT", name: "Italia", dialCode: "39", minLen: 9, maxLen: 10 },
  { iso2: "GB", name: "Reino Unido", dialCode: "44", minLen: 10, maxLen: 10 },
  { iso2: "IE", name: "Irlanda", dialCode: "353", minLen: 9, maxLen: 9 },
  { iso2: "NL", name: "Países Bajos", dialCode: "31", minLen: 9, maxLen: 9 },
  { iso2: "BE", name: "Bélgica", dialCode: "32", minLen: 8, maxLen: 9 },
  { iso2: "LU", name: "Luxemburgo", dialCode: "352", minLen: 6, maxLen: 9 },
  { iso2: "CH", name: "Suiza", dialCode: "41", minLen: 9, maxLen: 9 },
  { iso2: "AT", name: "Austria", dialCode: "43", minLen: 7, maxLen: 13 },
  { iso2: "SE", name: "Suecia", dialCode: "46", minLen: 7, maxLen: 9 },
  { iso2: "NO", name: "Noruega", dialCode: "47", minLen: 8, maxLen: 8 },
  { iso2: "DK", name: "Dinamarca", dialCode: "45", minLen: 8, maxLen: 8 },
  { iso2: "FI", name: "Finlandia", dialCode: "358", minLen: 9, maxLen: 10 },
  { iso2: "IS", name: "Islandia", dialCode: "354", minLen: 7, maxLen: 9 },
  { iso2: "PL", name: "Polonia", dialCode: "48", minLen: 9, maxLen: 9 },
  { iso2: "CZ", name: "República Checa", dialCode: "420", minLen: 9, maxLen: 9 },
  { iso2: "SK", name: "Eslovaquia", dialCode: "421", minLen: 9, maxLen: 9 },
  { iso2: "HU", name: "Hungría", dialCode: "36", minLen: 8, maxLen: 9 },
  { iso2: "RO", name: "Rumanía", dialCode: "40", minLen: 9, maxLen: 9 },
  { iso2: "BG", name: "Bulgaria", dialCode: "359", minLen: 8, maxLen: 9 },
  { iso2: "GR", name: "Grecia", dialCode: "30", minLen: 10, maxLen: 10 },
  { iso2: "HR", name: "Croacia", dialCode: "385", minLen: 8, maxLen: 9 },
  { iso2: "SI", name: "Eslovenia", dialCode: "386", minLen: 8, maxLen: 8 },
  { iso2: "RS", name: "Serbia", dialCode: "381", minLen: 8, maxLen: 9 },
  { iso2: "BA", name: "Bosnia y Herzegovina", dialCode: "387", minLen: 8, maxLen: 8 },
  { iso2: "ME", name: "Montenegro", dialCode: "382", minLen: 8, maxLen: 8 },
  { iso2: "MK", name: "Macedonia del Norte", dialCode: "389", minLen: 8, maxLen: 8 },
  { iso2: "AL", name: "Albania", dialCode: "355", minLen: 9, maxLen: 9 },
  { iso2: "XK", name: "Kosovo", dialCode: "383", minLen: 8, maxLen: 8 },
  { iso2: "EE", name: "Estonia", dialCode: "372", minLen: 7, maxLen: 8 },
  { iso2: "LV", name: "Letonia", dialCode: "371", minLen: 8, maxLen: 8 },
  { iso2: "LT", name: "Lituania", dialCode: "370", minLen: 8, maxLen: 8 },
  { iso2: "UA", name: "Ucrania", dialCode: "380", minLen: 9, maxLen: 9 },
  { iso2: "BY", name: "Bielorrusia", dialCode: "375", minLen: 9, maxLen: 9 },
  { iso2: "MD", name: "Moldavia", dialCode: "373", minLen: 8, maxLen: 8 },
  { iso2: "RU", name: "Rusia", dialCode: "7", minLen: 10, maxLen: 10 },
  { iso2: "KZ", name: "Kazajistán", dialCode: "7", minLen: 10, maxLen: 10 },
  { iso2: "TR", name: "Turquía", dialCode: "90", minLen: 10, maxLen: 10 },
  { iso2: "CY", name: "Chipre", dialCode: "357", minLen: 8, maxLen: 8 },
  { iso2: "MT", name: "Malta", dialCode: "356", minLen: 8, maxLen: 8 },
  { iso2: "AD", name: "Andorra", dialCode: "376", minLen: 6, maxLen: 6 },
  { iso2: "MC", name: "Mónaco", dialCode: "377", minLen: 8, maxLen: 9 },
  { iso2: "SM", name: "San Marino", dialCode: "378", minLen: 6, maxLen: 10 },
  { iso2: "VA", name: "Ciudad del Vaticano", dialCode: "39" },
  { iso2: "LI", name: "Liechtenstein", dialCode: "423", minLen: 7, maxLen: 9 },

  { iso2: "US", name: "Estados Unidos", dialCode: "1", minLen: 10, maxLen: 10 },
  { iso2: "CA", name: "Canadá", dialCode: "1", minLen: 10, maxLen: 10 },
  { iso2: "MX", name: "México", dialCode: "52", minLen: 10, maxLen: 10 },
  { iso2: "GT", name: "Guatemala", dialCode: "502", minLen: 8, maxLen: 8 },
  { iso2: "BZ", name: "Belice", dialCode: "501", minLen: 7, maxLen: 7 },
  { iso2: "SV", name: "El Salvador", dialCode: "503", minLen: 8, maxLen: 8 },
  { iso2: "HN", name: "Honduras", dialCode: "504", minLen: 8, maxLen: 8 },
  { iso2: "NI", name: "Nicaragua", dialCode: "505", minLen: 8, maxLen: 8 },
  { iso2: "CR", name: "Costa Rica", dialCode: "506", minLen: 8, maxLen: 8 },
  { iso2: "PA", name: "Panamá", dialCode: "507", minLen: 7, maxLen: 8 },
  { iso2: "CU", name: "Cuba", dialCode: "53", minLen: 8, maxLen: 8 },
  { iso2: "DO", name: "República Dominicana", dialCode: "1", minLen: 10, maxLen: 10 },
  { iso2: "PR", name: "Puerto Rico", dialCode: "1", minLen: 10, maxLen: 10 },
  { iso2: "JM", name: "Jamaica", dialCode: "1", minLen: 10, maxLen: 10 },
  { iso2: "TT", name: "Trinidad y Tobago", dialCode: "1", minLen: 10, maxLen: 10 },
  { iso2: "HT", name: "Haití", dialCode: "509", minLen: 8, maxLen: 8 },
  { iso2: "BS", name: "Bahamas", dialCode: "1", minLen: 10, maxLen: 10 },
  { iso2: "BB", name: "Barbados", dialCode: "1", minLen: 10, maxLen: 10 },
  { iso2: "CO", name: "Colombia", dialCode: "57", minLen: 10, maxLen: 10 },
  { iso2: "VE", name: "Venezuela", dialCode: "58", minLen: 10, maxLen: 10 },
  { iso2: "EC", name: "Ecuador", dialCode: "593", minLen: 9, maxLen: 9 },
  { iso2: "PE", name: "Perú", dialCode: "51", minLen: 9, maxLen: 9 },
  { iso2: "BO", name: "Bolivia", dialCode: "591", minLen: 8, maxLen: 8 },
  { iso2: "CL", name: "Chile", dialCode: "56", minLen: 9, maxLen: 9 },
  { iso2: "AR", name: "Argentina", dialCode: "54", minLen: 10, maxLen: 11 },
  { iso2: "PY", name: "Paraguay", dialCode: "595", minLen: 9, maxLen: 9 },
  { iso2: "UY", name: "Uruguay", dialCode: "598", minLen: 8, maxLen: 8 },
  { iso2: "BR", name: "Brasil", dialCode: "55", minLen: 10, maxLen: 11 },
  { iso2: "GY", name: "Guyana", dialCode: "592", minLen: 7, maxLen: 7 },
  { iso2: "SR", name: "Surinam", dialCode: "597", minLen: 6, maxLen: 7 },

  { iso2: "CN", name: "China", dialCode: "86", minLen: 11, maxLen: 11 },
  { iso2: "JP", name: "Japón", dialCode: "81", minLen: 10, maxLen: 10 },
  { iso2: "KR", name: "Corea del Sur", dialCode: "82", minLen: 9, maxLen: 10 },
  { iso2: "KP", name: "Corea del Norte", dialCode: "850" },
  { iso2: "IN", name: "India", dialCode: "91", minLen: 10, maxLen: 10 },
  { iso2: "PK", name: "Pakistán", dialCode: "92", minLen: 10, maxLen: 10 },
  { iso2: "BD", name: "Bangladés", dialCode: "880", minLen: 10, maxLen: 10 },
  { iso2: "LK", name: "Sri Lanka", dialCode: "94", minLen: 9, maxLen: 9 },
  { iso2: "NP", name: "Nepal", dialCode: "977", minLen: 10, maxLen: 10 },
  { iso2: "BT", name: "Bután", dialCode: "975", minLen: 8, maxLen: 8 },
  { iso2: "MM", name: "Birmania", dialCode: "95", minLen: 8, maxLen: 10 },
  { iso2: "TH", name: "Tailandia", dialCode: "66", minLen: 9, maxLen: 9 },
  { iso2: "VN", name: "Vietnam", dialCode: "84", minLen: 9, maxLen: 10 },
  { iso2: "KH", name: "Camboya", dialCode: "855", minLen: 8, maxLen: 9 },
  { iso2: "LA", name: "Laos", dialCode: "856", minLen: 9, maxLen: 10 },
  { iso2: "MY", name: "Malasia", dialCode: "60", minLen: 9, maxLen: 10 },
  { iso2: "SG", name: "Singapur", dialCode: "65", minLen: 8, maxLen: 8 },
  { iso2: "ID", name: "Indonesia", dialCode: "62", minLen: 9, maxLen: 12 },
  { iso2: "PH", name: "Filipinas", dialCode: "63", minLen: 10, maxLen: 10 },
  { iso2: "BN", name: "Brunéi", dialCode: "673", minLen: 7, maxLen: 7 },
  { iso2: "TL", name: "Timor Oriental", dialCode: "670", minLen: 7, maxLen: 8 },
  { iso2: "MN", name: "Mongolia", dialCode: "976", minLen: 8, maxLen: 8 },
  { iso2: "HK", name: "Hong Kong", dialCode: "852", minLen: 8, maxLen: 8 },
  { iso2: "MO", name: "Macao", dialCode: "853", minLen: 8, maxLen: 8 },
  { iso2: "TW", name: "Taiwán", dialCode: "886", minLen: 9, maxLen: 9 },
  { iso2: "AF", name: "Afganistán", dialCode: "93", minLen: 9, maxLen: 9 },
  { iso2: "UZ", name: "Uzbekistán", dialCode: "998", minLen: 9, maxLen: 9 },
  { iso2: "TM", name: "Turkmenistán", dialCode: "993", minLen: 8, maxLen: 8 },
  { iso2: "TJ", name: "Tayikistán", dialCode: "992", minLen: 9, maxLen: 9 },
  { iso2: "KG", name: "Kirguistán", dialCode: "996", minLen: 9, maxLen: 9 },
  { iso2: "GE", name: "Georgia", dialCode: "995", minLen: 9, maxLen: 9 },
  { iso2: "AM", name: "Armenia", dialCode: "374", minLen: 8, maxLen: 8 },
  { iso2: "AZ", name: "Azerbaiyán", dialCode: "994", minLen: 9, maxLen: 9 },

  { iso2: "SA", name: "Arabia Saudita", dialCode: "966", minLen: 9, maxLen: 9 },
  { iso2: "AE", name: "Emiratos Árabes Unidos", dialCode: "971", minLen: 9, maxLen: 9 },
  { iso2: "QA", name: "Catar", dialCode: "974", minLen: 8, maxLen: 8 },
  { iso2: "KW", name: "Kuwait", dialCode: "965", minLen: 8, maxLen: 8 },
  { iso2: "BH", name: "Baréin", dialCode: "973", minLen: 8, maxLen: 8 },
  { iso2: "OM", name: "Omán", dialCode: "968", minLen: 8, maxLen: 8 },
  { iso2: "YE", name: "Yemen", dialCode: "967", minLen: 9, maxLen: 9 },
  { iso2: "IQ", name: "Irak", dialCode: "964", minLen: 10, maxLen: 10 },
  { iso2: "IR", name: "Irán", dialCode: "98", minLen: 10, maxLen: 10 },
  { iso2: "IL", name: "Israel", dialCode: "972", minLen: 9, maxLen: 9 },
  { iso2: "PS", name: "Palestina", dialCode: "970", minLen: 9, maxLen: 9 },
  { iso2: "JO", name: "Jordania", dialCode: "962", minLen: 9, maxLen: 9 },
  { iso2: "LB", name: "Líbano", dialCode: "961", minLen: 7, maxLen: 8 },
  { iso2: "SY", name: "Siria", dialCode: "963", minLen: 9, maxLen: 9 },

  { iso2: "EG", name: "Egipto", dialCode: "20", minLen: 10, maxLen: 10 },
  { iso2: "LY", name: "Libia", dialCode: "218", minLen: 9, maxLen: 10 },
  { iso2: "TN", name: "Túnez", dialCode: "216", minLen: 8, maxLen: 8 },
  { iso2: "DZ", name: "Argelia", dialCode: "213", minLen: 9, maxLen: 9 },
  { iso2: "MA", name: "Marruecos", dialCode: "212", minLen: 9, maxLen: 9 },
  { iso2: "EH", name: "Sahara Occidental", dialCode: "212" },
  { iso2: "SD", name: "Sudán", dialCode: "249", minLen: 9, maxLen: 9 },
  { iso2: "SS", name: "Sudán del Sur", dialCode: "211", minLen: 9, maxLen: 9 },
  { iso2: "ET", name: "Etiopía", dialCode: "251", minLen: 9, maxLen: 9 },
  { iso2: "ER", name: "Eritrea", dialCode: "291", minLen: 7, maxLen: 7 },
  { iso2: "DJ", name: "Yibuti", dialCode: "253", minLen: 8, maxLen: 8 },
  { iso2: "SO", name: "Somalia", dialCode: "252", minLen: 8, maxLen: 9 },
  { iso2: "KE", name: "Kenia", dialCode: "254", minLen: 9, maxLen: 9 },
  { iso2: "UG", name: "Uganda", dialCode: "256", minLen: 9, maxLen: 9 },
  { iso2: "TZ", name: "Tanzania", dialCode: "255", minLen: 9, maxLen: 9 },
  { iso2: "RW", name: "Ruanda", dialCode: "250", minLen: 9, maxLen: 9 },
  { iso2: "BI", name: "Burundi", dialCode: "257", minLen: 8, maxLen: 8 },
  { iso2: "NG", name: "Nigeria", dialCode: "234", minLen: 10, maxLen: 10 },
  { iso2: "GH", name: "Ghana", dialCode: "233", minLen: 9, maxLen: 9 },
  { iso2: "CI", name: "Costa de Marfil", dialCode: "225", minLen: 8, maxLen: 10 },
  { iso2: "SN", name: "Senegal", dialCode: "221", minLen: 9, maxLen: 9 },
  { iso2: "ML", name: "Malí", dialCode: "223", minLen: 8, maxLen: 8 },
  { iso2: "BF", name: "Burkina Faso", dialCode: "226", minLen: 8, maxLen: 8 },
  { iso2: "NE", name: "Níger", dialCode: "227", minLen: 8, maxLen: 8 },
  { iso2: "TD", name: "Chad", dialCode: "235", minLen: 8, maxLen: 8 },
  { iso2: "CM", name: "Camerún", dialCode: "237", minLen: 9, maxLen: 9 },
  { iso2: "CF", name: "República Centroafricana", dialCode: "236", minLen: 8, maxLen: 8 },
  { iso2: "GA", name: "Gabón", dialCode: "241", minLen: 7, maxLen: 9 },
  { iso2: "CG", name: "República del Congo", dialCode: "242", minLen: 9, maxLen: 9 },
  { iso2: "CD", name: "República Democrática del Congo", dialCode: "243", minLen: 9, maxLen: 9 },
  { iso2: "GQ", name: "Guinea Ecuatorial", dialCode: "240", minLen: 9, maxLen: 9 },
  { iso2: "GW", name: "Guinea-Bisáu", dialCode: "245", minLen: 7, maxLen: 7 },
  { iso2: "GN", name: "Guinea", dialCode: "224", minLen: 8, maxLen: 9 },
  { iso2: "SL", name: "Sierra Leona", dialCode: "232", minLen: 8, maxLen: 8 },
  { iso2: "LR", name: "Liberia", dialCode: "231", minLen: 7, maxLen: 9 },
  { iso2: "TG", name: "Togo", dialCode: "228", minLen: 8, maxLen: 8 },
  { iso2: "BJ", name: "Benín", dialCode: "229", minLen: 8, maxLen: 8 },
  { iso2: "MR", name: "Mauritania", dialCode: "222", minLen: 8, maxLen: 8 },
  { iso2: "GM", name: "Gambia", dialCode: "220", minLen: 7, maxLen: 7 },
  { iso2: "CV", name: "Cabo Verde", dialCode: "238", minLen: 7, maxLen: 7 },
  { iso2: "ST", name: "Santo Tomé y Príncipe", dialCode: "239", minLen: 7, maxLen: 7 },
  { iso2: "ZA", name: "Sudáfrica", dialCode: "27", minLen: 9, maxLen: 9 },
  { iso2: "NA", name: "Namibia", dialCode: "264", minLen: 9, maxLen: 9 },
  { iso2: "BW", name: "Botsuana", dialCode: "267", minLen: 7, maxLen: 8 },
  { iso2: "ZW", name: "Zimbabue", dialCode: "263", minLen: 9, maxLen: 9 },
  { iso2: "ZM", name: "Zambia", dialCode: "260", minLen: 9, maxLen: 9 },
  { iso2: "MW", name: "Malaui", dialCode: "265", minLen: 7, maxLen: 9 },
  { iso2: "MZ", name: "Mozambique", dialCode: "258", minLen: 9, maxLen: 9 },
  { iso2: "AO", name: "Angola", dialCode: "244", minLen: 9, maxLen: 9 },
  { iso2: "SZ", name: "Esuatini", dialCode: "268", minLen: 8, maxLen: 8 },
  { iso2: "LS", name: "Lesoto", dialCode: "266", minLen: 8, maxLen: 8 },
  { iso2: "MG", name: "Madagascar", dialCode: "261", minLen: 9, maxLen: 9 },
  { iso2: "MU", name: "Mauricio", dialCode: "230", minLen: 7, maxLen: 8 },
  { iso2: "SC", name: "Seychelles", dialCode: "248", minLen: 7, maxLen: 7 },
  { iso2: "KM", name: "Comoras", dialCode: "269", minLen: 7, maxLen: 7 },

  { iso2: "AU", name: "Australia", dialCode: "61", minLen: 9, maxLen: 9 },
  { iso2: "NZ", name: "Nueva Zelanda", dialCode: "64", minLen: 8, maxLen: 10 },
  { iso2: "FJ", name: "Fiyi", dialCode: "679", minLen: 7, maxLen: 7 },
  { iso2: "PG", name: "Papúa Nueva Guinea", dialCode: "675", minLen: 7, maxLen: 8 },
  { iso2: "SB", name: "Islas Salomón", dialCode: "677", minLen: 7, maxLen: 7 },
  { iso2: "VU", name: "Vanuatu", dialCode: "678", minLen: 7, maxLen: 7 },
  { iso2: "NC", name: "Nueva Caledonia", dialCode: "687", minLen: 6, maxLen: 6 },
  { iso2: "PF", name: "Polinesia Francesa", dialCode: "689", minLen: 6, maxLen: 8 },
  { iso2: "WS", name: "Samoa", dialCode: "685", minLen: 5, maxLen: 7 },
  { iso2: "TO", name: "Tonga", dialCode: "676", minLen: 5, maxLen: 7 },
  { iso2: "KI", name: "Kiribati", dialCode: "686", minLen: 5, maxLen: 8 },
  { iso2: "FM", name: "Micronesia", dialCode: "691", minLen: 7, maxLen: 7 },
  { iso2: "PW", name: "Palaos", dialCode: "680", minLen: 7, maxLen: 7 },
  { iso2: "MH", name: "Islas Marshall", dialCode: "692", minLen: 7, maxLen: 7 },
  { iso2: "NR", name: "Nauru", dialCode: "674", minLen: 7, maxLen: 7 },
  { iso2: "TV", name: "Tuvalu", dialCode: "688", minLen: 5, maxLen: 6 },
];

const SORTED_BY_DIAL_LENGTH = [...PHONE_COUNTRIES].sort(
  (a, b) => b.dialCode.length - a.dialCode.length,
);

export function flagEmoji(iso2: string): string {
  const codePoints = [...iso2.toUpperCase()].map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function findCountry(iso2: string): PhoneCountry {
  return (
    PHONE_COUNTRIES.find((c) => c.iso2 === iso2) ??
    PHONE_COUNTRIES.find((c) => c.iso2 === DEFAULT_COUNTRY_ISO2)!
  );
}

export function parsePhoneValue(value: string): { iso2: string; number: string } {
  const trimmed = value.trim();
  if (trimmed.startsWith("+")) {
    const digits = trimmed.slice(1);
    const match = SORTED_BY_DIAL_LENGTH.find((c) => digits.startsWith(c.dialCode));
    if (match) {
      return { iso2: match.iso2, number: digits.slice(match.dialCode.length).trim() };
    }
  }
  return { iso2: DEFAULT_COUNTRY_ISO2, number: trimmed };
}

export function combinePhoneValue(iso2: string, number: string): string {
  const trimmedNumber = number.trim();
  if (!trimmedNumber) return "";
  const country = findCountry(iso2);
  return `+${country.dialCode} ${trimmedNumber}`;
}

export function validatePhoneNumber(iso2: string, number: string): boolean {
  const digits = number.replace(/\D/g, "");
  if (!digits) return true;
  const country = findCountry(iso2);
  const minLen = country.minLen ?? DEFAULT_MIN_LEN;
  const maxLen = country.maxLen ?? DEFAULT_MAX_LEN;
  return digits.length >= minLen && digits.length <= maxLen;
}
