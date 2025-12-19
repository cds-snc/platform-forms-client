import { NextResponse } from "next/server";

// Simple call to get the current server time
// Can also be used as a health beacon

const GET = async () => {
  return NextResponse.json({ serverTime: Math.floor(Date.now() / 1000) });
};

export { GET };
