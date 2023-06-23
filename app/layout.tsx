import React from "react";
import "../styles/app.scss";

import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/*
          <head /> will contain the components returned by the nearest parent
          head.jsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
        */}
      <head />
      <body>
        <header className="mb-12 border-b-1 border-gray-500 px-4 py-2 laptop:px-32 desktop:px-64">
          <div className="grid w-full grid-flow-col">
            <div className="flex">
              <Link href="/admin">admin</Link>
              <div className="mt-3 box-border block h-[40px] px-2 py-1 text-base font-bold">dd</div>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
