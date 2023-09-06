import React from "react";
import { getPageClassNames } from "@lib/routeUtils";
import Footer from "@components/globals/Footer";
import SkipLink from "@components/globals/SkipLink";
import Fip from "@components/globals/Fip";
import { PublicFormRecord } from "@lib/types";
import Head from "next/head";

interface FormDisplayLayoutProps extends React.PropsWithChildren {
  formRecord: PublicFormRecord;
  embedded: boolean;
}

const FormDisplayLayout = ({ children, formRecord, embedded }: FormDisplayLayoutProps) => {
  const classes = getPageClassNames(formRecord);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta charSet="utf-8" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" sizes="32x32" />
      </Head>
      <SkipLink />

      <div className={classes}>
        {!embedded && (
          <header>
            <Fip formRecord={formRecord} showLogin={false} showLanguageToggle={true} />
          </header>
        )}
        <div id="page-container">
          <main id="content">{children}</main>
        </div>
        {!embedded && <Footer disableGcBranding={formRecord?.form.brand?.disableGcBranding} />}
      </div>
    </>
  );
};

export default FormDisplayLayout;
