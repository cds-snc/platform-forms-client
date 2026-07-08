import { authorization } from "@lib/privileges";
import { I18n } from "@root/i18n";
import { Settings } from "./components/client/Settings";
import { Suspense } from "react";
import Loader from "@clientComponents/globals/Loader";
import { Messages } from "./components/client/Messages";
import { AuthenticatedPage } from "@lib/pages/auth";
import { PageTitle } from "@root/components/serverComponents/globals/PageTitle";
import { getAllAppSettings } from "@root/lib/appSettings";

// Note: the searchParam is used as the language key to display the success or error message
export default AuthenticatedPage(
  [authorization.canAccessSettings],
  async (props: { searchParams: Promise<{ success?: string; error?: string }> }) => {
    const searchParams = await props.searchParams;

    const { success, error } = searchParams;

    return (
      <>
        <PageTitle key="title" namespace="admin-settings" />
        <h1 className="mb-10 border-0">
          <I18n i18nKey="title" namespace="admin-settings" />
        </h1>
        <Messages success={success} error={error} />
        <Suspense fallback={<Loader />}>
          <Settings settings={await getAllAppSettings()} />
        </Suspense>
      </>
    );
  }
);
