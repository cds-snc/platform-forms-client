import { middleware, csrfProtected } from "@lib/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { sendPasswordResetLink } from "@lib/auth";

export const POST = middleware([csrfProtected()], async (request: NextRequest) => {
  const { email }: { email?: string } = await request.json();

  if (!email) return NextResponse.json({ error: "Malformed request" }, { status: 400 });

  try {
    await sendPasswordResetLink(email);
    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send password reset link" }, { status: 500 });
  }
});
