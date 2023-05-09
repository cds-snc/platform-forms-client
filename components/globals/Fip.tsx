import React from "react";
import { useSession } from "next-auth/react";
import LanguageToggle from "./LanguageToggle";
import Menu from "@components/auth/LoginMenu";
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
}) => {
  const brand = formRecord?.form ? formRecord.form.brand : null;

  const { status } = useSession();

  return (
    <div data-testid="fip" className="gc-fip">
      <div className="canada-flag">
        <Brand brand={brand} />
      </div>
      <div className="inline-flex gap-4">
        {showLogin && <Menu isAuthenticated={status === "authenticated"} />}
        {showLanguageToggle && <LanguageToggle />}
      </div>
    </div>
  );
};

export default Fip;
