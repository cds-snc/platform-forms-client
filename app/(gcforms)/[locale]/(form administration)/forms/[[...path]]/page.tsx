import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { requireAuthentication } from "@lib/auth";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { AccessControlError } from "@lib/privileges";
import { redirect } from "next/navigation";
import { Navigation } from "./components/server/Navigation";
import { ResumeEditingForm } from "@clientComponents/form-builder/app/shared";
import Link from "next/link";
import { Cards } from "./components/server/Cards";
import { Suspense } from "react";
import Loader from "@clientComponents/globals/Loader";
import { NewFormButton } from "./components/client/NewFormButton";

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

export default async function Page({
  params: { locale },
  searchParams: { formsState },
}: {
  params: { locale: string };
  searchParams: { formsState?: string };
}) {
  try {
    const {
      user: { ability, id },
    } = await requireAuthentication();

    checkPrivilegesAsBoolean(ability, [{ action: "view", subject: "FormRecord" }], {
      redirect: true,
    });

    const {
      t,
      i18n: { language },
    } = await serverTranslation(["my-forms"]);

    return (
      <div className="center mx-auto w-[980px] bg-gray-soft">
        <h1 className="mb-8 border-b-0">{t("title")}</h1>
        <div className="flex w-full justify-between">
          <Navigation filter={formsState} />
          <NewFormButton />
        </div>

        {/* TODO: ask Tim and Dave how to implement now with new code. Note will also need an Id */}
        <ResumeEditingForm>
          <Link href={`/${language}/form-builder/edit`} className="mb-4 inline-block">
            <span aria-hidden="true"> ← </span> {t("actions.resumeForm")}
          </Link>
        </ResumeEditingForm>

        <Suspense fallback={<Loader />}>
          <Cards filter={formsState} ability={ability} id={id} />
        </Suspense>
      </div>
    );
  } catch (e) {
    if (e instanceof AccessControlError) {
      redirect(`/${locale}/admin/unauthorized`);
    }
  }
}
