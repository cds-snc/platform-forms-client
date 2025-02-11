import { Suspense } from "react";
import { serverTranslation } from "@i18n";
import { AuthenticatedPage } from "@lib/pages/auth";
import { authorization } from "@lib/privileges";
import { getUser } from "@lib/users";
import { BackLink } from "@clientComponents/admin/LeftNav/BackLink";
import { Metadata } from "next";
import { getAllTemplates } from "@lib/templates";
import { FormCard } from "./components/server/FormCard";
import { Loader } from "@clientComponents/globals/Loader";

import { getOverdueTemplateIds } from "@lib/overdue";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("admin-forms", { lang: locale });
  return {
    title: `${t("title")}`,
  };
}

export default AuthenticatedPage<{ id: string }>(
  [authorization.canViewAllUsers, authorization.canViewAllForms],
  async ({ params }) => {
    const { id, locale } = await params;

    const formUser = await getUser(id);

    const templates = (
      await getAllTemplates({
        requestedWhere: {
          users: {
            some: {
              id,
            },
          },
        },
      })
    ).map((template) => {
      const {
        id,
        form: { titleEn, titleFr },
        isPublished,
        createdAt,
      } = template;

      return {
        id,
        titleEn,
        titleFr,
        isPublished,
        createdAt: Number(createdAt),
      };
    });

    const overdueTemplateIds = await getOverdueTemplateIds(
      templates.map((template) => template.id)
    );

    const { t } = await serverTranslation(["admin-forms", "admin-users"], { lang: locale });

    return (
      <>
        <div>
          <BackLink href={`/${locale}/admin/accounts?id=${formUser.id}`}>
            {t("backToAccounts", { ns: "admin-users" })}
          </BackLink>
          <h1 className="mb-10 border-0">
            {formUser && <span className="block text-base">{formUser?.name}</span>}
            {formUser && <span className="block text-base font-normal">{formUser?.email}</span>}
            {t("title")}
          </h1>
        </div>

        {templates.length === 0 ? (
          <div className="mb-4">
            <p>{t("noForms")}</p>
          </div>
        ) : null}

        <ul className="m-0 list-none p-0">
          {templates.map(({ id, titleEn, titleFr, isPublished }) => {
            const overdue = overdueTemplateIds.includes(id);
            return (
              <Suspense key={id} fallback={<Loader />}>
                <FormCard
                  key={id}
                  id={id}
                  titleEn={titleEn}
                  titleFr={titleFr}
                  isPublished={isPublished}
                  overdue={overdue}
                />
              </Suspense>
            );
          })}
        </ul>
      </>
    );
  }
);
