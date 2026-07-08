import { authorization } from "@lib/privileges";
import { AuthenticatedPage } from "@lib/pages/auth";
import { ManageSettingForm } from "../components/server/ManageSettingForm";
import { Suspense } from "react";
import Loader from "@clientComponents/globals/Loader";
import { PageTitle } from "@root/components/serverComponents/globals/PageTitle";
import { I18n } from "@root/i18n";

export default AuthenticatedPage<{ settingId: string }>(
  [authorization.canManageSettings],
  async ({ params }) => {
    const { settingId } = await params;

    await authorization.canManageSettings().catch(() => authorization.unauthorizedRedirect());

    return (
      <>
        <PageTitle key="title-update" namespace="admin-settings" />

        <h1 className="mb-10 border-0">
          <I18n i18nKey="title-update" namespace="admin-settings" />
        </h1>
        <Suspense fallback={<Loader />}>
          <ManageSettingForm settingId={settingId} />
        </Suspense>
      </>
    );
  }
);
