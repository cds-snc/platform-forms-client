import { createGcPlatformLoginHintCookie } from "../login/components/client/gcPlatformLoginHintCookie";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ locale: string }> }
) => {
  const { locale } = await params;
  const loginUrl = new URL(`/${locale}/auth/login`, request.url);

  // Set search parameter (gcPlatformLogin) in addition to setting the cookie
  // Avoid race conditions where the cookie might not be visible immediately in the browser
  loginUrl.searchParams.set("gcPlatformLogin", "1");

  return new Response(null, {
    status: 307,
    headers: {
      Location: loginUrl.toString(),
      "Set-Cookie": createGcPlatformLoginHintCookie(),
    },
  });
};
