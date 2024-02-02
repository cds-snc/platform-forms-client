import { type NextRequest, NextResponse } from "next/server";
import { MiddlewareRequest, MiddlewareReturn } from "@lib/types";
import axios from "axios";
import { headers } from "next/headers";
import { logMessage } from "@lib/logger";

export const csrfProtected = (): MiddlewareRequest => {
  return async (req: NextRequest): Promise<MiddlewareReturn> => {
    if (req.method === "GET") return { next: true };
    const csrfToken = await internalCsrfToken(req).catch(() => "");
    const csrfHeader = headers().get("x-csrf-token");
    if (csrfToken && csrfToken === csrfHeader) {
      // Compare csrfToken with csrfCookie
      return { next: true };
    } else {
      return {
        next: false,
        response: NextResponse.json({ error: "Access Denied" }, { status: 403 }),
      };
    }
  };
};

const internalCsrfToken = async (req: NextRequest): Promise<string> => {
  // Ensure we're using the same cookies as the client
  const csrfUrl = `http://127.0.0.1:3000/api/auth/csrf`;
  const cookies = req.cookies as unknown as string;
  const csrfToken: string | undefined = await axios
    .get(csrfUrl, { headers: { cookie: cookies } })
    .then((res) => res.data.csrfToken);

  return csrfToken ?? "";
};
