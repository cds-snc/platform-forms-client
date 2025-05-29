import { serverTranslation } from "@i18n";
import { getTemplateWithAssociatedUsers, checkIfClosed } from "@lib/templates";
import { authorization } from "@lib/privileges";
import { getUsers } from "@lib/users";
import { ManageForm } from "./ManageForm";
import { Metadata } from "next";
import { headers } from "next/headers";
import { ApiKeyDialog } from "../../components/dialogs/ApiKeyDialog/ApiKeyDialog";
import { DeleteApiKeyDialog } from "../../components/dialogs/DeleteApiKeyDialog/DeleteApiKeyDialog";
import { AuthenticatedPage } from "@lib/pages/auth";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("form-builder", { lang: locale });

  return {
    title: `${t("settings.formManagement")} — ${t("gcForms")}`,
  };
}

export default AuthenticatedPage(async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;

  const { id } = params;

  let closedDetails;

  const manageAllForms = await authorization
    .canManageAllForms()
    .then(() => true)
    .catch(() => false);
  const canSetClosingDate =
    id !== "0000" ||
    (await authorization
      .canEditForm(id)
      .then(() => true)
      .catch(() => false));

  const nonce = (await headers()).get("x-nonce");

  if (canSetClosingDate) {
    const closedData = await checkIfClosed(id);
    closedDetails = closedData?.closedDetails;
  }

  if (id === "0000") {
    return (
      <ManageForm
        nonce={nonce}
        id={id}
        canManageAllForms={false}
        canSetClosingDate={canSetClosingDate}
        closedDetails={closedDetails}
      />
    );
  }

  const templateWithAssociatedUsers = await getTemplateWithAssociatedUsers(id);

  if (!templateWithAssociatedUsers) {
    throw new Error("Template not found");
  }

  // :warning: almost all users will enter here, only admin users will get past
  if (!manageAllForms) {
    return (
      <ManageForm
        nonce={nonce}
        id={id}
        formRecord={templateWithAssociatedUsers.formRecord}
        canManageAllForms={false}
        canSetClosingDate={canSetClosingDate}
        closedDetails={closedDetails}
      />
    );
  }

  const allUsers = await getUsers().then((users) =>
    users.map((user) => ({
      id: user.id,
      name: user.name || "",
      email: user.email || "",
    }))
  );

  const isPublished = templateWithAssociatedUsers.formRecord.isPublished;
  const isVaultDelivery = !templateWithAssociatedUsers.formRecord.deliveryMethod;

  return (
    <>
      <ManageForm
        nonce={nonce}
        id={id}
        canManageAllForms={manageAllForms}
        canSetClosingDate={canSetClosingDate}
        formRecord={templateWithAssociatedUsers.formRecord}
        usersAssignedToFormRecord={templateWithAssociatedUsers.users}
        allUsers={allUsers}
        closedDetails={closedDetails}
      />
      {/* 
        - Only show for users with manage all forms privileges
            - we do an additional check here in case the code above to reach this point changes later
        - Only show for forms with vault delivery already set
        - Only show for live forms 
            - draft forms should use Response Delivery page
      */}
      {isPublished && manageAllForms && isVaultDelivery && (
        <>
          <ApiKeyDialog isVaultDelivery={true} />
          <DeleteApiKeyDialog />
        </>
      )}
    </>
  );
});
