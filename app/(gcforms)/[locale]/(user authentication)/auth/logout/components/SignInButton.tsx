"use client";
import { signIn } from "next-auth/react";
import { Button } from "@clientComponents/globals";

export const SignInButton = ({ locale, label }: { locale: string; label: string }) => {
  return (
    <form
      action={async () => {
        await signIn("gcForms", { redirectTo: `/${locale}/auth/policy` }, { max_age: 0 });
      }}
    >
      <Button type="submit" theme="primary">
        {label}
      </Button>
    </form>
  );
};
