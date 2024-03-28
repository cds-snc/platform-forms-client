"use server";
import { signOut } from "@lib/auth";

export const logout = async (locale: string) => {
  await signOut({ redirect: true, redirectTo: `/${locale}/auth/logout` });
};
