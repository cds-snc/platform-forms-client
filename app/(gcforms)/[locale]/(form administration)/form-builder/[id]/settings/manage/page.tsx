import { serverTranslation } from "@i18n";
import { getTemplateWithAssociatedUsers, checkIfClosed } from "@lib/templates";
import { authorization } from "@lib/privileges";
import { getUsers } from "@lib/users";
import { ManageForm } from "./ManageForm";
import { Metadata } from "next";
import { headers } from "next/headers";
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

  // ⚠️ This is the main entry point for the manage form page. Code beyond this if block
  // is only reached if the user is an "admin" (can manage all forms)
  if (!manageAllForms || id === "0000") {
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

  const allUsers = await getUsers().then((users) =>
    users.map((user) => ({
      id: user.id,
      name: user.name || "",
      email: user.email || "",
    }))
  );

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
    </>
  );
});
