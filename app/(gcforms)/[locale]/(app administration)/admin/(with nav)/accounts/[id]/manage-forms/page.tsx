import { Suspense } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { serverTranslation } from "@i18n";
import { AuthenticatedPage } from "@lib/pages/auth";
import { authorization } from "@lib/privileges";
import { getUser } from "@lib/users";
import { BackLink } from "@clientComponents/admin/LeftNav/BackLink";
import { Metadata } from "next";
import { getAllTemplates } from "@lib/templates";
import { FormCard } from "./components/server/FormCard";
import { ManageOwners } from "@formBuilder/[id]/settings/components/manageFormOwners/ManageOwners";
import ManageOwnersDialogClient from "./components/client/ManageOwnersDialogClient";

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
  async (props: {
    params: Promise<{ id: string; locale: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }) => {
    const { id, locale } = await props.params;

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
    const searchParams = await props.searchParams;
    const manageOwnershipFormId = searchParams?.manageOwnership;
    const manageFormId = Array.isArray(manageOwnershipFormId)
      ? manageOwnershipFormId[0]
      : manageOwnershipFormId;

    return (
      <>
        <div id="manage-forms-main">
          <div className="relative z-30">
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
            {templates.map(({ id, titleEn, titleFr, isPublished }, idx) => {
              const overdue = overdueTemplateIds.includes(id);
              return (
                <Suspense
                  key={id}
                  fallback={
                    idx === 0 ? (
                      <div className="mb-6 max-w-4xl rounded-2xl border-2 border-black bg-white p-6 shadow-md">
                        <div className="flex items-start justify-between">
                          <Skeleton height={28} width={`50%`} />
                          <div className="ml-4">
                            <Skeleton height={28} width={100} />
                          </div>
                        </div>

                        <div className="mt-4">
                          <Skeleton height={14} width={`35%`} />
                        </div>

                        <div className="mt-6 flex items-end justify-between">
                          <div className="flex gap-3">
                            <Skeleton height={36} width={140} />
                            <Skeleton height={36} width={140} />
                          </div>
                          <div>
                            <Skeleton height={36} width={56} />
                          </div>
                        </div>
                      </div>
                    ) : null
                  }
                >
                  <FormCard
                    key={id}
                    id={id}
                    titleEn={titleEn}
                    titleFr={titleFr}
                    isPublished={isPublished}
                    overdue={overdue}
                    accountId={formUser.id}
                  />
                </Suspense>
              );
            })}
          </ul>
        </div>

        {manageFormId ? (
          <>
            <ManageOwnersDialogClient>
              <ManageOwners id={manageFormId} />
            </ManageOwnersDialogClient>
          </>
        ) : null}
      </>
    );
  }
);
