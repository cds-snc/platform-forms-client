import React from "react";
import { getPageClassNames } from "@lib/routeUtils";
import Footer from "@components/globals/Footer";
import SkipLink from "@components/globals/SkipLink";
import Fip from "@components/globals/Fip";
import { PublicFormRecord } from "@lib/types";
import { HeadMeta } from "./HeadMeta";

interface FormDisplayLayoutProps extends React.PropsWithChildren {
  formRecord: PublicFormRecord;
  embedded: boolean;
}

const FormDisplayLayout = ({ children, formRecord, embedded }: FormDisplayLayoutProps) => {
  const classes = getPageClassNames(formRecord);

  return (
    <>
      <HeadMeta />
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
