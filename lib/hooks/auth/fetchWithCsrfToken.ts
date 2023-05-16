import axios from "axios";
import { getCsrfToken } from "next-auth/react";

export async function fetchWithCsrfToken(url: string, data: Record<string, string>) {
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
