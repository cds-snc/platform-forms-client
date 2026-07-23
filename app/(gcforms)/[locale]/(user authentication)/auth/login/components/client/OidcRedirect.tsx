"use client";

import Loader from "@clientComponents/globals/Loader";
import { signIn } from "next-auth/react";
import { useEffect } from "react";

type OidcRedirectProps = {
  locale: string;
};

export const OidcRedirect = ({ locale }: OidcRedirectProps) => {
  useEffect(() => {
    void signIn("gcForms", { redirectTo: `/${locale}/auth/policy` }, { max_age: 0 });
  }, [locale]);

  return <Loader className="py-12" />;
};
