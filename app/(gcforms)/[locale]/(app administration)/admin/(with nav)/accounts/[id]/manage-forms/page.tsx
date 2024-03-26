import { Suspense } from "react";
import { serverTranslation } from "@i18n";
import { auth } from "@lib/auth";
import { checkPrivilegesAsBoolean, createAbility } from "@lib/privileges";
import { getUser } from "@lib/users";
import { BackLink } from "@clientComponents/admin/LeftNav/BackLink";
import { Metadata } from "next";
import { getAllTemplatesForUser } from "@lib/templates";
import { FormCard } from "./components/server/FormCard";
import { Loader } from "@clientComponents/globals/Loader";
import { redirect } from "next/navigation";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("admin-forms", { lang: locale });
  return {
    title: `${t("title")}`,
  };
}

export default async function Page({
  params: { id, locale },
}: {
  params: { id: string; locale: string };
}) {
  const session = await auth();
  if (!session) redirect(`/${locale}/auth/login`);
  const ability = createAbility(session);

  checkPrivilegesAsBoolean(
    ability,
    [
      { action: "view", subject: "User" },
      {
        action: "view",
        subject: {
          type: "FormRecord",
          // Passing an empty object here just to force CASL evaluate the condition part of a permission.
          // Will only allow users who have privilege of Manage All Forms
          object: {},
        },
      },
    ],
    { redirect: true }
  );

  const formUser = await getUser(user.ability, id);

  const templates = (await getAllTemplatesForUser(user.ability, id as string)).map((template) => {
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
        {templates.map(({ id, titleEn, titleFr, isPublished }) => (
          <Suspense key={id} fallback={<Loader />}>
            <FormCard
              key={id}
              id={id}
              titleEn={titleEn}
              titleFr={titleFr}
              isPublished={isPublished}
            />
          </Suspense>
        ))}
      </ul>
    </>
  );
}
