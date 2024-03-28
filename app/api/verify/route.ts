import { type NextRequest, NextResponse } from "next/server";
import axios from "axios";

export const POST = async (req: NextRequest) => {
  try {
    const { userToken } = await req.json();
    if (userToken) {
      const reCAPTCHASecret = process.env.RECAPTCHA_V3_SECRET_KEY;
      if (!reCAPTCHASecret) throw new Error("RECAPTCHA_V3_SECRET_KEY is not set");
      const response = await axios({
        url: `https://www.google.com/recaptcha/api/siteverify?secret=${reCAPTCHASecret}&response=${userToken}`,
        method: "POST",
        timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
      });
      return NextResponse.json({ ...response.data });
    } else {
      return NextResponse.json({ error: "Malformed API Request" }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: "Failed to verify ReCaptcha token" }, { status: 500 });
  }
};
