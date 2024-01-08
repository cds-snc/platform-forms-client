import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { requireAuthentication } from "@lib/auth";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { getAllTemplates } from "@lib/templates";
import { getUnprocessedSubmissionsForUser } from "@lib/users";
import { FullWidthLayout } from "@clientComponents/globals/layouts";
import RenderMyForms from "./clientSide";
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("my-forms", { lang: locale });
  return {
    title: t("title"),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const {
    user: { ability, id },
  } = await requireAuthentication();

  checkPrivilegesAsBoolean(ability, [{ action: "view", subject: "FormRecord" }], {
    redirect: true,
  });

  const templates = (await getAllTemplates(ability, id)).map((template) => {
    const {
      id,
      form: { titleEn = "", titleFr = "" },
      name,
      deliveryOption = { emailAddress: "" },
      isPublished,
      updatedAt,
    } = template;
    return {
      id,
      titleEn,
      titleFr,
      deliveryOption,
      name,
      isPublished,
      date: updatedAt ?? Date.now().toString(),
      url: `/${locale}/id/${id}`,
      overdue: 0,
    };
  });

  const overdue = await getUnprocessedSubmissionsForUser(ability, id);

  templates.forEach((template) => {
    if (overdue[template.id]) {
      template.overdue = overdue[template.id].numberOfSubmissions;
    }
  });

  return (
    <FullWidthLayout>
      <RenderMyForms {...{ templates, locale }} />
    </FullWidthLayout>
  );
}
