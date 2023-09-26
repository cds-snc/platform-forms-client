import React from "react";
import Head from "next/head";

import { PublicFormRecord } from "@lib/types";
import Footer from "@components/globals/Footer";
import SkipLink from "@components/globals/SkipLink";
import Fip from "@components/globals/Fip";
import LanguageToggle from "../LanguageToggle";
import { DateModified } from "../DateModified";

interface FormDisplayLayoutProps extends React.PropsWithChildren {
  formRecord: PublicFormRecord;
  embedded: boolean;
}

const FormDisplayLayout = ({ children, formRecord, embedded }: FormDisplayLayoutProps) => {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta charSet="utf-8" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" sizes="32x32" />
      </Head>
      <SkipLink />
      <div>
        {!embedded && (
          <header>
            <Fip formRecord={formRecord} className="mb-20 mt-0 border-b-4 border-blue-dark py-9">
              <LanguageToggle />
            </Fip>
          </header>
        )}
        <div id="page-container" className="gc-formview">
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
