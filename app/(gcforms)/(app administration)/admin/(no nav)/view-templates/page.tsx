import { authorization } from "@lib/privileges";

import { DataView } from "./clientSide";
import { getAllTemplates } from "@lib/templates/queries/getAllTemplates";
import { AuthenticatedPage } from "@lib/pages/auth";
import { PageTitle } from "@root/components/serverComponents/globals/PageTitle";

export default AuthenticatedPage([authorization.canManageAllForms], async () => {
  const allTemplates = await getAllTemplates();

  const templatesToDataViewObject = allTemplates.map((template) => {
    const {
      id,
      form: { titleEn, titleFr },
      isPublished,
      updatedAt,
    } = template;

    return { id, titleEn, titleFr, isPublished, updatedAt };
  });

  return (
    <>
      <PageTitle key="view.title" namespace="admin-templates" />
      <DataView templates={templatesToDataViewObject} />;
    </>
  );
});
