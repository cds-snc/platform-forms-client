import React, { ReactElement, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

import { NextPageWithLayout } from "../_app";
import { Template, PageProps, PageTemplate, getServerSideProps } from "./[[...params]]";
import { ElementPanel } from "@components/form-builder/layout/";

const Page: NextPageWithLayout<PageProps> = () => {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const { t } = useTranslation("form-builder");

  useEffect(() => {
    router.replace(router.pathname, router.pathname, { shallow: true });
    setReady(true);
  }, []);

  const title = `${t("gcFormsEdit")} — ${t("gcForms")}`;
  return ready ? (
    <PageTemplate title={title}>
      <ElementPanel />
    </PageTemplate>
  ) : null;
};

Page.getLayout = (page: ReactElement) => {
  return <Template page={page} />;
};

export { getServerSideProps };
export default Page;
