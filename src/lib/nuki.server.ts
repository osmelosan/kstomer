// Server-only helpers for the Nuki Web API integration.
//
// Mirrors the shape of stripe.server.ts: a guarded env reader, a configured
// "client" (here a small fetch wrapper), and an error normaliser. Secrets never
// leave this module — the per-organization Nuki API token is stored AES-GCM
// encrypted (encryptToken/decryptToken) and only decrypted here, server-side.
//
// SECURITY: never import this from a *.functions.ts or route file at the top
// level — those ship to the client bundle. Import it only from other .server.ts
// modules (nuki.functions.ts uses `await import(...)`).

const NUKI_API_BASE = "https://api.nuki.io";

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} is not configured`);
  return value;
};

// ---------------------------------------------------------------------------
// Token encryption (AES-GCM). The key is derived from NUKI_TOKEN_ENCRYPTION_KEY
// via SHA-256 so any passphrase length works. Stored as "base64(iv):base64(ct)".
// ---------------------------------------------------------------------------
async function getCryptoKey(usage: KeyUsage[]): Promise<CryptoKey> {
  const secret = getEnv("NUKI_TOKEN_ENCRYPTION_KEY");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, usage);
}

export async function encryptToken(plain: string): Promise<string> {
  const key = await getCryptoKey(["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plain),
  );
  const ivB64 = Buffer.from(iv).toString("base64");
  const ctB64 = Buffer.from(new Uint8Array(ct)).toString("base64");
  return `${ivB64}:${ctB64}`;
}

export async function decryptToken(stored: string): Promise<string> {
  const [ivB64, ctB64] = stored.split(":", 2);
  if (!ivB64 || !ctB64) throw new Error("Malformed encrypted token");
  const key = await getCryptoKey(["decrypt"]);
  const iv = new Uint8Array(Buffer.from(ivB64, "base64"));
  const ct = Buffer.from(ctB64, "base64");
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return new TextDecoder().decode(plain);
}

// ---------------------------------------------------------------------------
// Nuki Web API client
// ---------------------------------------------------------------------------
export function getNukiErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message ?? "Nuki request failed");
  }
  return "Nuki request failed";
}

async function nukiFetch<T = unknown>(
  token: string,
  path: string,
  init?: RequestInit,
): Promise<T | null> {
  const res = await fetch(`${NUKI_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let detail = "";
    try {
      detail = await res.text();
    } catch {
      /* ignore */
    }
    if (res.status === 401 || res.status === 403) {
      throw new Error("Nuki rejected the API token (unauthorized). Check the token.");
    }
    throw new Error(`Nuki API error ${res.status}${detail ? `: ${detail}` : ""}`);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : null;
}

export type NukiSmartlock = {
  smartlockId: number;
  name: string;
  type: number;
  state?: { state?: number; batteryCritical?: boolean };
};

export type NukiAuth = {
  id: string;
  name: string;
  type: number;
  smartlockId: number;
};

/** Lists the smart locks visible to the token. Also used to validate a token. */
export async function listSmartlocks(token: string): Promise<NukiSmartlock[]> {
  const data = await nukiFetch<NukiSmartlock[]>(token, "/smartlock");
  return data ?? [];
}

/** Recent activity log entries across the account's smart locks. */
export async function listActivityLog(token: string, limit = 20): Promise<unknown[]> {
  const data = await nukiFetch<unknown[]>(token, `/smartlock/log?limit=${limit}`);
  return data ?? [];
}

type TimeRestrictions = {
  allowedFromDate?: string;
  allowedUntilDate?: string;
  allowedWeekDays?: number;
  allowedFromTime?: number;
  allowedUntilTime?: number;
};

/** Creates a keypad PIN code authorization (auth type 13). */
export async function createKeypadCode(
  token: string,
  smartlockId: number,
  params: { name: string; code: number } & TimeRestrictions,
): Promise<void> {
  await nukiFetch(token, `/smartlock/${smartlockId}/auth`, {
    method: "PUT",
    body: JSON.stringify({ ...params, type: 13 }),
  });
}

/** Creates (or reuses) an account user, then an app-key authorization for them. */
export async function createAppKey(
  token: string,
  smartlockId: number,
  params: { name: string; email: string } & TimeRestrictions,
): Promise<void> {
  const { email, name, ...restrictions } = params;
  const user = await nukiFetch<{
    accountUserId?: number;
    accountUser?: { accountUserId?: number };
  }>(token, "/account/user", { method: "PUT", body: JSON.stringify({ email, name }) });
  const accountUserId = user?.accountUserId ?? user?.accountUser?.accountUserId;
  if (!accountUserId) throw new Error("Could not resolve Nuki account user id");
  await nukiFetch(token, `/smartlock/${smartlockId}/auth`, {
    method: "PUT",
    body: JSON.stringify({
      accountUserId,
      name,
      remoteAllowed: true,
      smartActionsEnabled: false,
      ...restrictions,
    }),
  });
}

/**
 * Resolves the Nuki auth id for a just-created authorization. Creation is
 * asynchronous and returns no id, so we list the lock's auths and match by name.
 */
export async function findAuthId(
  token: string,
  smartlockId: number,
  name: string,
): Promise<string | null> {
  const data = await nukiFetch<NukiAuth[]>(token, `/smartlock/${smartlockId}/auth`);
  const match = (data ?? []).filter((a) => a.name === name).pop();
  return match?.id ?? null;
}

/** Revokes an authorization by its Nuki auth id. */
export async function deleteAuth(
  token: string,
  smartlockId: number,
  authId: string,
): Promise<void> {
  await nukiFetch(token, `/smartlock/${smartlockId}/auth/${authId}`, { method: "DELETE" });
}
