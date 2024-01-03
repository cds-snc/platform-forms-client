import { type NextRequest, NextResponse } from "next/server";
import { MiddlewareRequest, MiddlewareReturn } from "@lib/types";
import axios from "axios";

export const csrfProtected = (): MiddlewareRequest => {
  return async (req: NextRequest): Promise<MiddlewareReturn> => {
    const csrfToken = await internalCsrfToken(req).catch(() => "");
    const csrfCookie = req.cookies.get("x-csrf-token") || ""; // Ensure a string value for csrfCookie

    if (csrfToken && csrfToken === csrfCookie) {
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
  const csrfUrl = `${process.env.NEXTAUTH_URL}/api/auth/csrf`;
  const cookies = req.cookies.getAll() as unknown as string[];
  const csrfToken: string | undefined = await axios
    .get(csrfUrl, { headers: { cookie: cookies } })
    .then((res) => res.data.csrfToken);
  return csrfToken ?? "";
};
