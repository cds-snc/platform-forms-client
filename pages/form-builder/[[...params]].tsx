import React, { ReactElement, useEffect, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { Layout } from "../../components/form-builder/layout/Layout";
import { Header } from "../../components/form-builder/layout/Header";
import { checkPrivileges } from "@lib/privileges";
import { NextPageWithLayout } from "../_app";
import Footer from "../../components/globals/Footer";
import { getTemplateByID } from "@lib/templates";
import { FormRecord } from "@lib/types";
import { useRouter } from "next/router";
import { NavigationStoreProvider } from "@components/form-builder/store/useNavigationStore";
import { TemplateStoreProvider } from "@components/form-builder/store/useTemplateStore";
import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { createAbility } from "@lib/privileges";

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

Page.getLayout = (page: ReactElement) => {
  return (
    <NavigationStoreProvider currentTab={page.props.tab as string}>
      <TemplateStoreProvider
        {...(page.props.initialForm && (page.props.initialForm as FormRecord))}
      >
        <div id="form-builder">
          <Header />
          {page}
          <Footer />
        </div>
      </TemplateStoreProvider>
    </NavigationStoreProvider>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  query: { params },
  locale,
  req,
  res,
}) => {
  const [tab = "start", formID = null] = params || [];
  const FormbuilderParams: { tab: string; initialForm: null | FormRecord } = {
    tab,
    initialForm: null,
  };
  const session = await unstable_getServerSession(req, res, authOptions);

  if (session && !session.user.acceptableUse) {
    // If they haven't agreed to Acceptable Use redict to policy page for acceptance
    return {
      redirect: {
        destination: `/${locale}/auth/policy`,
        permanent: false,
      },
    };
  }

  if (formID && session) {
    const ability = createAbility(session.user.privileges);
    checkPrivileges(ability, [{ action: "update", subject: "FormRecord" }]);
    FormbuilderParams.initialForm = await getTemplateByID(formID);
  }

  return {
    props: {
      ...FormbuilderParams,
      ...(locale && (await serverSideTranslations(locale, ["common", "form-builder"]))),
    },
  };
};

export default Page;
