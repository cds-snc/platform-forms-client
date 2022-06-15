import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { GetServerSideProps } from "next";

export function middleware(req: NextRequest) {
  const browser = req.ua?.browser.name;
  const url = req.nextUrl;
  const { pathname } = req.nextUrl;

  //   if (browser == "Chrome") {
  //     // return NextResponse.redirect(`${url.origin}/not-supported`);
  //   }
  //   if (pathname == "/id/2") {
  //     return NextResponse.redirect(`${url.origin}/not-supported`);
  //   }
  //   return NextResponse.next();
  // return new Response(`Path: ${pathname}`)
}

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const req = new NextRequest();
//   const browser = req.ua?.browser.name;
//   return { props: {}, redirect: {} };
// };
