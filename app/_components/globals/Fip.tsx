"use client";
import React from "react";
import { SessionProvider } from "next-auth/react";
import { PublicFormRecord } from "@lib/types";
import Brand from "./Brand";
import { cn } from "@lib/utils";

const Fip = ({
  formRecord,
  children,
  className,
}: {
  formRecord?: PublicFormRecord;
  children?: React.ReactNode;
  className?: string;
}) => {
  const brand = formRecord?.form ? formRecord.form.brand : null;

  return (
    <SessionProvider>
      <div
        data-testid="fip"
        className={cn("gc-fip", "my-20 py-0 px-[4rem] laptop:px-32", className)}
      >
        <div className="canada-flag">
          <Brand brand={brand} />
        </div>
        <div className="inline-flex gap-4">{children}</div>
      </div>
    </SessionProvider>
  );
};

export default Fip;
