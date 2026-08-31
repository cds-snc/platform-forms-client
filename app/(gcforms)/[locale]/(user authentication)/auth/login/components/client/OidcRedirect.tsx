"use client";

import Loader from "@clientComponents/globals/Loader";
import { gcFormsAuthorizationParamsLogin } from "@lib/auth/gcFormsAuthorizationParams";
import { signIn } from "next-auth/react";
import { useEffect } from "react";

type OidcRedirectProps = {
  locale: string;
};

export const OidcRedirect = ({ locale }: OidcRedirectProps) => {
  useEffect(() => {
    void signIn(
      "gcForms",
      { redirectTo: `/${locale}/auth/policy` },
      gcFormsAuthorizationParamsLogin
    );
  }, [locale]);

  return <Loader className="py-12" />;
};
