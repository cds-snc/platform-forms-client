"use client";
import React from "react";
import { PublicFormRecord } from "@lib/types";
import Brand from "./Brand";

export const Fip = ({ formRecord }: { formRecord?: PublicFormRecord }) => {
  const brand = formRecord?.form ? formRecord.form.brand : null;
  return (
    <div className="gcds-signature brand__signature">
      <Brand brand={brand} />
    </div>
  );
};
