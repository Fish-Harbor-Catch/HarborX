// randomUUID requires HTTPS on non-localhost origins. getRandomValues also works
// on an ordinary HTTP LAN development address and still provides random UUIDs.
export function createId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = [...bytes].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      credentials: "include",
      cache: "no-store",
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error(
      "Cannot reach the server. Check your connection and make sure the backend is running.",
    );
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const e = new Error(data.error || "The request could not be completed.");
    e.status = response.status;
    throw e;
  }
  return data;
}
export const money = (n) =>
  new Intl.NumberFormat("en-LK", { maximumFractionDigits: 2 }).format(
    Number(n) || 0,
  );
export const date = (v, options = {}) =>
  v
    ? new Date(v).toLocaleString("en-GB", {
        timeZone: "Asia/Colombo",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        ...options,
      })
    : "—";
export const initials = (s) =>
  s
    .split(" ")
    .slice(0, 2)
    .map((v) => v[0])
    .join("")
    .toUpperCase();
