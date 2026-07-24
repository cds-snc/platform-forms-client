"use client";
import { signIn } from "next-auth/react";
import { Button } from "@clientComponents/globals";
import { gcFormsAuthorizationParams } from "@lib/auth/gcFormsAuthorizationParams";

/*
 * This component renders a sign-in button that initiates the OIDC login flow when clicked. It uses NextAuth's signIn function to redirect the user to the OIDC provider's login page, and specifies a callback URL to return to after authentication.
 */
export const SignInButton = ({ locale, label }: { locale: string; label: string }) => {
  return (
    <form
      action={async () => {
        await signIn(
          "gcForms",
          { redirectTo: `/${locale}/auth/policy` },
          gcFormsAuthorizationParams
        );
      }}
    >
      <Button type="submit" theme="primary">
        {label}
      </Button>
    </form>
  );
};
