"use client";

import { PublicFormRecord } from "@lib/types";
import { DateModified } from "../DateModified";
import { cn } from "@lib/utils";
import { type JSX } from "react";
import { GcdsHeader } from "@serverComponents/globals/GcdsHeader/GcdsHeader";
import { BrandHeader } from "@serverComponents/globals/GcdsHeader/BrandHeader";
import { type Language } from "@lib/types/form-builder-types";

interface FormDisplayLayoutProps extends React.PropsWithChildren {
  formRecord: PublicFormRecord;
  dateModified?: boolean;
  footer?: JSX.Element;
  language: Language;
  pathname?: string;
}

const FormDisplayHeader = ({
  formRecord,
  language,
  pathname,
}: {
  formRecord: PublicFormRecord;
  language: Language;
  pathname: string;
}) => {
  const brand = formRecord?.form ? formRecord.form.brand : null;
  const hasCustom = brand?.logoEn && brand?.logoFr;

  if (!hasCustom) {
    return <GcdsHeader pathname={pathname} language={language} />;
  }

  return <BrandHeader brand={brand} pathname={pathname} language={language} />;
};

const FormDisplayLayout = ({
  children,
  formRecord,
  dateModified = true,
  footer,
  language,
  pathname = "",
}: FormDisplayLayoutProps) => {
  return (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta charSet="utf-8" />
      <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" sizes="32x32" />
      <div className="flex h-full flex-col">
        <FormDisplayHeader language={language} formRecord={formRecord} pathname={pathname} />
        <div
          className={cn(
            "gc-formview",
            "shrink-0 grow basis-auto py-0",
            "container-xl mx-auto px-[var(--gcds-spacing-225)] tablet:px-[var(--gcds-spacing-600)] laptop:px-0"
          )}
        >
          <main id="content" className="h-full" tabIndex={-1}>
            {children}
            {dateModified && <DateModified updatedAt={formRecord.updatedAt} />}
          </main>
        </div>
        {footer}
      </div>
    </>
  );
};

export default FormDisplayLayout;
