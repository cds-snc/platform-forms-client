import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../../pages/api/auth/[...nextauth]";

export default async function DemoPage() {
  const session = await getServerSession(authOptions);
  return (
    <>
      <h1>Admin home page</h1>
      <div>
        <Link href="/admin/accounts">Test {JSON.stringify(session)}</Link>
      </div>
    </>
  );
}
