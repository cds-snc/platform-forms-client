import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

// Token rotates each hour
const TOKEN_WINDOW_MS = 60 * 60 * 1000;
// Validation accepts current and previous window for boundary tolerance
const TOKEN_HEX_PATTERN = /^[0-9a-f]{64}$/;

function currentWindow(): number {
  return Math.floor(Date.now() / TOKEN_WINDOW_MS);
}

// Binds the HMAC to both the formId + "address-complete" string to prevent token reuse
function computeHmac(secret: string, formId: string, window: number): Buffer {
  return Buffer.from(
    createHmac("sha256", secret).update(`address-complete:${formId}:${window}`).digest("hex"),
    "hex"
  );
}

export function generateAddressToken(formId: string): string {
  const secret = process.env.ADDRESSCOMPLETE_TOKEN_SECRET;
  if (!secret) return "";
  return computeHmac(secret, formId, currentWindow()).toString("hex");
}

// Returns true when ADDRESSCOMPLETE_TOKEN_SECRET is unset (dev) or the token matches a valid window.
export function validateAddressToken(formId: string, token: string): boolean {
  const secret = process.env.ADDRESSCOMPLETE_TOKEN_SECRET;
  if (!secret) return true;
  if (!token || !TOKEN_HEX_PATTERN.test(token)) return false;

  const window = currentWindow();
  const tokenBuf = Buffer.from(token, "hex");

  return (
    timingSafeEqual(tokenBuf, computeHmac(secret, formId, window)) ||
    timingSafeEqual(tokenBuf, computeHmac(secret, formId, window - 1))
  );
}
