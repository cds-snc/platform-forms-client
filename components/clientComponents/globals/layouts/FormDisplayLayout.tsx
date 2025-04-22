"use client";

import { PublicFormRecord } from "@lib/types";
import { SkipLink, Fip } from "@clientComponents/globals";
import LanguageToggle from "../Header/LanguageToggle";
import { DateModified } from "../DateModified";
import { cn } from "@lib/utils";
import { LiveRegion } from "../LiveRegion";
import { type JSX } from "react";

interface FormDisplayLayoutProps extends React.PropsWithChildren {
  formRecord: PublicFormRecord;
  dateModified?: boolean;
  footer?: JSX.Element;
}

const FormDisplayLayout = ({
  children,
  formRecord,
  dateModified = true,
  footer,
}: FormDisplayLayoutProps) => {
  return (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta charSet="utf-8" />
      <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" sizes="32x32" />

      <SkipLink />
      <div className="flex h-full flex-col">
        <header>
          <Fip formRecord={formRecord} className="mb-20 mt-0 border-b-4 border-blue-dark py-9">
            <LanguageToggle />
          </Fip>
        </header>
        <div
          className={cn(
            "gc-formview",
            "shrink-0 grow basis-auto px-[1rem] tablet:px-[4rem] py-0 laptop:px-32"
          )}
        >
          <main id="content" className="h-full" tabIndex={-1}>
            {children}
            {dateModified && <DateModified updatedAt={formRecord.updatedAt} />}
          </main>
        </div>
        {footer}
        <LiveRegion />
      </div>
    </>
  );
};

export default FormDisplayLayout;
