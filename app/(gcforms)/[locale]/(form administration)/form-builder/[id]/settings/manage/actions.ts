"use server";

import { headers } from "next/headers";

export const getNonce = async () => {
  const nonce = headers().get("x-nonce");
  return nonce;
};
