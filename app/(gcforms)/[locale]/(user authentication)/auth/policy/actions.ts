"use server";

import { redirect } from "next/navigation";
import { authCheckAndThrow } from "@lib/actions";

export const acceptPolicy = async (_: unknown, formData: FormData) => {
  const language = formData.get("language") as string;

  const { session } = await authCheckAndThrow();

  if (!session) {
    redirect(`/${language}/auth/login`);
  }

  // Note: The acceptableUse flag is managed in the JWT token
  // The proxy middleware will check for this flag on subsequent requests
  // We need to trigger the session to update on the client side after redirect
  // For now, just redirect and let the middleware handle checking acceptableUse

  // The session update needs to happen client-side via next-auth's update() method
  // But we can redirect server-side

  // Check if user is newly registered
  if (session.user.newlyRegistered) {
    redirect(`/${language}/auth/account-created`);
  } else {
    redirect(`/${language}/forms`);
  }
};
