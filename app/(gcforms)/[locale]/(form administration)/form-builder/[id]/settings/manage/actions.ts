"use server";

import { headers } from "next/headers";

// Can throw because it is not called by Client Components
// @todo Should these types of functions be moved to a different file?
export const getNonce = async () => {
  const nonce = headers().get("x-nonce");
  return nonce;
};
