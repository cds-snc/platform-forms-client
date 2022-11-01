import React, { ReactElement, useEffect, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { Layout } from "../../../components/form-builder/layout/Layout";
import { Header } from "../../../components/form-builder/layout/Header";
import { checkPrivileges } from "@lib/privileges";
import { NextPageWithLayout } from "../../_app";
import Footer from "../../../components/globals/Footer";
import { getTemplateByID } from "@lib/templates";
import { FormRecord } from "@lib/types";
import { useRouter } from "next/router";
import { NavigationStoreProvider } from "@components/form-builder/store/useNavigationStore";
import { TemplateStoreProvider } from "@components/form-builder/store/useTemplateStore";

type PageProps = {
  tab: string;
  initialForm: FormRecord | null;
};

const Page: NextPageWithLayout<PageProps> = () => {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    router.replace(router.pathname, router.pathname, { shallow: true });
    setReady(true);
  }, []);

  return ready ? <Layout /> : <main className="container--wet" />;
};

Page.getLayout = function getLayout(page: ReactElement) {
  /*
  if (page.props.initialForm) {
    const typeRefactoredForm = { ...initialForm } as unknown as TemplateSchema;
    typeRefactoredForm.form.endPage = {
      descriptionEn: "",
      descriptionFr: "",
    };
    // typeRefactoredForm.form.elements = sortByLayout(typeRefactoredForm.form);
    importTemplate(typeRefactoredForm);
  }
  */
  return (
    <NavigationStoreProvider currentTab={page.props.tab}>
      <TemplateStoreProvider form={page.props.initialForm}>
        <div id="form-builder">
          <Header />
          {page}
          <Footer />
        </div>
      </TemplateStoreProvider>
    </NavigationStoreProvider>
  );
};

export const getServerSideProps = requireAuthentication(
  async ({ query: { params }, user: { ability }, locale }) => {
    checkPrivileges(ability, [{ action: "update", subject: "FormRecord" }]);
    const [tab = "start", formID = null] = params || [];
    const FormbuilderParams: { tab: string; initialForm: null | FormRecord } = {
      tab,
      initialForm: null,
    };

    if (formID) {
      FormbuilderParams.initialForm = await getTemplateByID(formID);
    }

    return {
      props: {
        ...FormbuilderParams,
        ...(locale && (await serverSideTranslations(locale, ["common", "form-builder"]))),
      },
    };
  }
);

export default Page;
