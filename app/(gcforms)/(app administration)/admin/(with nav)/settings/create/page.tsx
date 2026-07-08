import { authorization } from "@lib/privileges";
import { AuthenticatedPage } from "@lib/pages/auth";
import { ManageSettingForm } from "../components/server/ManageSettingForm";
import { PageTitle } from "@root/components/serverComponents/globals/PageTitle";
import { I18n } from "@root/i18n";

export default AuthenticatedPage([authorization.canManageSettings], async () => {
  return (
    <>
      <PageTitle key="title-create" namespace="admin-settings" />
      <h1 className="mb-10 border-0">
        <I18n i18nKey="title-create" namespace="admin-settings" />
      </h1>
      <ManageSettingForm />
    </>
  );
});
