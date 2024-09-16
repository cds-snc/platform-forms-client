import { NextResponse } from "next/server";
import { checkFlag } from "@formBuilder/actions";

//Seperated from utils to avoid unavailable dependencies in testing and response downloads.
export const allowAddressComplete = async () => {
  return checkFlag("addressComplete");
};

// This route is used to allow Cypress Testing of components, and provide the API key for AddressComplete.
export const POST = async () => {
  const allowed = await allowAddressComplete();
  const key = allowed ? process.env.NEXT_PUBLIC_ADDRESSCOMPLETE_API_KEY : "";
  return NextResponse.json({ allowed: allowed, key: key });
};
