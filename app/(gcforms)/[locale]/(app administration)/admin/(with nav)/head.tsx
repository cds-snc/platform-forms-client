import { headers } from "next/headers";

export default async function Head() {
  const h = await headers();
  const hTyped = h as unknown as Headers;
  const nonce = hTyped.get("x-nonce") || "";

  return <>{nonce && <meta name="csp-nonce" content={nonce} />}</>;
}
