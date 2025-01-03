"use server";

import { headers } from "next/headers";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

// Can throw because it is not called by Client Components
// @todo Should these types of functions be moved to a different file?
export const getNonce = async () => {
  const nonce = (await headers()).get("x-nonce");
  return nonce;
};
