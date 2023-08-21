"use client";
import { SessionProvider, useSession } from "next-auth/react";
import LanguageToggle from "./LanguageToggle";
import Menu from "@appComponents/auth/LoginMenu";
import { PublicFormRecord } from "@lib/types";
import Brand from "./Brand";

const Fip = ({
  formRecord,
  showLogin = false,
  showLanguageToggle = true,
}: {
  formRecord?: PublicFormRecord;
  showLogin?: boolean;
  showLanguageToggle?: boolean;
  locale: string;
}) => {
  const brand = formRecord?.form ? formRecord.form.brand : null;

  return (
    <SessionProvider>
      <div data-testid="fip" className="gc-fip">
        <div className="canada-flag">
          <Brand brand={brand} />
        </div>
        <div className="inline-flex gap-4">
          {showLogin && <Menu />}
          {showLanguageToggle && <LanguageToggle />}
        </div>
      </div>
    </SessionProvider>
  );
};

export default Fip;
