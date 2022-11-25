import React, { ReactElement } from "react";
import Head from "next/head";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import { NextPageWithLayout } from "../_app";
import { getFullTemplateByID } from "@lib/templates";
import { FormRecord } from "@lib/types";
import { useRouter } from "next/router";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { AccessControlError, createAbility } from "@lib/privileges";
import SkipLink from "@components/globals/SkipLink";
import Footer from "@components/globals/Footer";
import Loader from "@components/globals/Loader";
import {
  useTemplateStore,
  useNavigationStore,
  NavigationStoreProvider,
  TemplateStoreProvider,
} from "@components/form-builder/store";
import { LeftNavigation, Header, Layout } from "@components/form-builder/layout/";

export type PageProps = {
  tab: string;
  initialForm: FormRecord | null;
};

export const Template = ({ page }: { page: ReactElement }) => {
  return (
    <NavigationStoreProvider currentTab={page.props.tab}>
      <TemplateStoreProvider {...(page.props.initialForm && page.props.initialForm)}>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
          <meta charSet="utf-8" />
          <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" sizes="32x32" />
        </Head>
        <div className="flex flex-col h-full">
          <SkipLink />
          <Header />
          {page}
          <Footer displaySLAAndSupportLinks />
        </div>
      </TemplateStoreProvider>
    </NavigationStoreProvider>
  );
};

export const PageTemplate = ({
  children,
  title,
  navigation,
}: {
  children: React.ReactNode;
  title: string;
  navigation?: React.ReactElement;
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { hasHydrated, form } = useTemplateStore((s) => ({
    form: s.form,
    hasHydrated: s._hasHydrated,
  }));

  const { currentTab, setTab } = useNavigationStore((s) => ({
    currentTab: s.currentTab,
    setTab: s.setTab,
  }));

  const handleClick = (tab: string) => {
    return (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      setTab(tab);
      router.push({ pathname: `/form-builder` });
    };
  };

  // Wait until the Template Store has fully hydrated before rendering the page
  return hasHydrated ? (
    <div id="page-container">
      <div className="grid grid-cols-12 gap-4">
        <LeftNavigation currentTab={currentTab} handleClick={handleClick} />
        <>
          {form && (
            <div className="col-start-4 col-span-9">
              <Head>
                <title>{title}</title>
              </Head>
              {navigation && React.cloneElement(navigation, { currentTab, handleClick })}
              <main id="content">{children}</main>
            </div>
          )}
        </>
      </div>
    </div>
  ) : (
    <Loader message={t("loading")} />
  );
};

const Page: NextPageWithLayout<PageProps> = () => {
  return <Layout />;
};

Page.getLayout = (page: ReactElement) => {
  return <Template page={page} />;
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
    // If they haven't agreed to Acceptable Use redirect to policy page for acceptance
    return {
      redirect: {
        destination: `/${locale}/auth/policy`,
        permanent: false,
      },
    };
  }

  // @todo - look into better way to handle setting page for "real" pages
  if (req.url === "/form-builder/settings") {
    FormbuilderParams.tab = "settings";
  }

  if (req.url === "/form-builder/edit") {
    FormbuilderParams.tab = "create";
  }

  if (formID && session) {
    try {
      const ability = createAbility(session.user.privileges);
      FormbuilderParams.initialForm = await getFullTemplateByID(ability, formID);
    } catch (e) {
      if (e instanceof AccessControlError) {
        return {
          redirect: {
            destination: `/${locale}/admin/unauthorized`,
            permanent: false,
          },
        };
      }
    }
  }

  return {
    props: {
      ...FormbuilderParams,
      ...(locale && (await serverSideTranslations(locale, ["common", "form-builder"]))),
    },
  };
};

export default Page;
