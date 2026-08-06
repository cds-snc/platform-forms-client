import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

// Token rotates each hour; validation accepts current and previous window for boundary tolerance
const TOKEN_WINDOW_MS = 60 * 60 * 1000;
const TOKEN_HEX_PATTERN = /^[0-9a-f]{64}$/;

function currentWindow(): number {
  return Math.floor(Date.now() / TOKEN_WINDOW_MS);
}

function computeHmac(secret: string, window: number): Buffer {
  return Buffer.from(createHmac("sha256", secret).update(String(window)).digest("hex"), "hex");
}

export function generateLogToken(): string {
  const secret = process.env.TOKEN_SECRET;
  if (!secret) return "";
  return computeHmac(secret, currentWindow()).toString("hex");
}

// Returns true when TOKEN_SECRET is unset (dev without env vars) or token matches a valid window
export function validateLogToken(token: string): boolean {
  const secret = process.env.TOKEN_SECRET;
  if (!secret) return true;
  if (!token || !TOKEN_HEX_PATTERN.test(token)) return false;

  const window = currentWindow();
  const tokenBuf = Buffer.from(token, "hex");
  // Accepts previous window to avoid rejecting tokens generated just before the hour boundary
  return (
    timingSafeEqual(tokenBuf, computeHmac(secret, window)) ||
    timingSafeEqual(tokenBuf, computeHmac(secret, window - 1))
  );
}
