import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../../pages/api/auth/[...nextauth]";
import { createAbility, getAllPrivileges, checkPrivilegesAsBoolean } from "../../lib/privileges";

export default async function DemoPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <div>Not logged in</div>;
  }

  const ability = createAbility(session);

  const canViewPrivileges = checkPrivilegesAsBoolean(ability, [
    { action: "view", subject: "Privilege" },
  ]);
  const allPrivileges = await getAllPrivileges(ability);

  return (
    <>
      <h1>Admin home page</h1>
      <div>
        <p>
          {session.user.name} ({session.user.email})
        </p>
        <p>
          <Link href="/admin/accounts">Test</Link>
        </p>
        {canViewPrivileges ? "true" : "false"}
        {/* JSON.stringify(session) */}
        {/* JSON.stringify(ability) */}
        {/* JSON.stringify(allPrivileges)*/}
      </div>
    </>
  );
}
