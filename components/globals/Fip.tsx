import React from "react";
import { PublicFormRecord } from "@lib/types";
import Brand from "./Brand";

const Fip = ({
  formRecord,
  children,
}: {
  formRecord?: PublicFormRecord;
  showLogin?: boolean;
  showLanguageToggle?: boolean;
  children?: React.ReactNode;
}) => {
  const brand = formRecord?.form ? formRecord.form.brand : null;

  return (
    <div data-testid="fip" className="gc-fip">
      <div className="canada-flag">
        <Brand brand={brand} />
      </div>
      <div className="inline-flex gap-4">{children}</div>
    </div>
  );
};

export default Fip;
