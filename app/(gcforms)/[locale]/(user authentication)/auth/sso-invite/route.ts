import { createGcPlatformLoginHintCookie } from "../login/components/client/gcPlatformLoginHintCookie";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ locale: string }> }
) => {
  const { locale } = await params;
  const loginUrl = new URL(`/${locale}/auth/login`, request.url);
  return new Response(null, {
    status: 307,
    headers: {
      Location: loginUrl.toString(),
      "Set-Cookie": createGcPlatformLoginHintCookie(),
    },
  });
};
