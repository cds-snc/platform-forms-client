"use client";

import { signIn } from "next-auth/react";
import { useEffect } from "react";

type OidcRedirectProps = {
  locale: string;
};

export const OidcRedirect = ({ locale }: OidcRedirectProps) => {
  useEffect(() => {
    void signIn("gcForms", { redirectTo: `/${locale}/auth/policy` }, { max_age: 0 });
  }, [locale]);

  return null;
};
