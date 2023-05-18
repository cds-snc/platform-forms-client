import axios from "axios";
import { getCsrfToken } from "next-auth/react";
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export async function fetchWithCsrfToken(url: string, data: Record<string, any>) {
  const token = await getCsrfToken();
  if (!token) {
    throw new Error("CSRF token not found");
  }

  return axios({
    url,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": token,
    },
    data,
    timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
  });
}
