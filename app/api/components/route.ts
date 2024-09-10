import { NextResponse } from "next/server";
import { middleware, sessionExists } from "@lib/middleware";
import { checkFlag } from "@formBuilder/actions";

//Seperated from utils to avoid unavailable dependencies in testing and response downloads.
export const allowAddressComplete = async () => {
  return checkFlag("addressComplete");
};

// This route is used to allow Cypress Testing of components, and provide the API key for AddressComplete.
export const POST = middleware([sessionExists()], async (req, props) => {
  const { id }: { id?: string } = props.body;
  if (!id) {
    const allowed = await allowAddressComplete();
    const key = allowed ? process.env.NEXT_PUBLIC_ADDRESSCOMPLETE_API_KEY : "";
    return NextResponse.json({ allowed: allowed, key: key });
  }

  //todo.... send cache.
  return NextResponse.json({ error: "Malformed request" }, { status: 400 });
});
