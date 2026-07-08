import { NextRequest } from "next/server";
import { authCheckAndThrow } from "@lib/actions";
import { authorization } from "@lib/privileges";
import { getExportableUsers, type UserSearchState } from "@lib/users";
import { buildAccountsCsv, getAccountsCsvFileName } from "../lib/download";

const isUserSearchState = (value: string | null): value is UserSearchState => {
  return value === "active" || value === "deactivated";
};

export async function GET(request: NextRequest) {
  await authCheckAndThrow();
  await Promise.all([authorization.canViewAllUsers(), authorization.canAccessPrivileges()]);

  const userState = request.nextUrl.searchParams.get("userState");

  if (!isUserSearchState(userState)) {
    return new Response("Invalid userState", { status: 400 });
  }

  const users = await getExportableUsers({ userState });
  const csv = buildAccountsCsv(users);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${getAccountsCsvFileName(userState)}"`,
      "Cache-Control": "no-store",
    },
  });
}
