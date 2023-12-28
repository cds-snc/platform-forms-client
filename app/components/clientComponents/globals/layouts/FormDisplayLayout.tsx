"use client";

import { PublicFormRecord } from "@lib/types";
import { Footer, SkipLink, Fip } from "@clientComponents/globals";
import LanguageToggle from "../LanguageToggle";
import { DateModified } from "../DateModified";
import { cn } from "@lib/utils";

interface FormDisplayLayoutProps extends React.PropsWithChildren {
  formRecord: PublicFormRecord;
  embedded: boolean;
}

const FormDisplayLayout = ({ children, formRecord, embedded }: FormDisplayLayoutProps) => {
  return (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta charSet="utf-8" />
      <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" sizes="32x32" />

      <SkipLink />
      <div>
        {!embedded && (
          <header>
            <Fip formRecord={formRecord} className="mb-20 mt-0 border-b-4 border-blue-dark py-9">
              <LanguageToggle />
            </Fip>
          </header>
        )}
        <div className={cn("gc-formview", "shrink-0 grow basis-auto px-[4rem] py-0 laptop:px-32")}>
          <main id="content">
            {children}
            <DateModified updatedAt={formRecord.updatedAt} />
          </main>
        </div>
        {!embedded && (
          <Footer className="mt-4" disableGcBranding={formRecord?.form.brand?.disableGcBranding} />
        )}
      </div>
    </>
  );
};

export default FormDisplayLayout;
