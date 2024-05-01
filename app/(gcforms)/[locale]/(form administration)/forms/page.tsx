import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { auth } from "@lib/auth";
import { checkPrivilegesAsBoolean, createAbility } from "@lib/privileges";
import { AccessControlError } from "@lib/privileges";
import { redirect } from "next/navigation";
import { Navigation } from "./components/server/Navigation";
import { Cards } from "./components/server/Cards";
import { NewFormButton } from "./components/server/NewFormButton";
import { ResumeEditingForm } from "./components/ResumeEditingForm";
import { getAllTemplates } from "@lib/templates";
import { DeliveryOption } from "@lib/types";

export type FormsTemplate = {
  id: string;
  titleEn: string;
  titleFr: string;
  deliveryOption: DeliveryOption;
  name: string;
  isPublished: boolean;
  date: string;
  url: string;
  overdue: number;
};

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
  searchParams: { status },
}: {
  params: { locale: string };
  searchParams: { status?: string };
}) {
  try {
    const session = await auth();
    if (!session) redirect(`/${locale}/admin/login`);
    const ability = createAbility(session);

    checkPrivilegesAsBoolean(ability, [{ action: "view", subject: "FormRecord" }], {
      redirect: true,
    });

    const { t } = await serverTranslation("my-forms", { lang: locale });

    // Moved from Cards to Page to avoid component being cached when navigating back to this page
    const where = {
      isPublished: status === "published" ? true : status === "draft" ? false : undefined,
    };
    const templates = (await getAllTemplates(ability, where, "desc")).map((template) => {
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

    return (
      <div className="center mx-auto w-[980px] bg-gray-soft">
        <h1 className="mb-8 border-b-0">{t("title")}</h1>
        <div className="flex w-full justify-between">
          <Navigation filter={status} />
          <NewFormButton />
        </div>

        <ResumeEditingForm />

        <Cards templates={templates} />
      </div>
    );
  } catch (e) {
    if (e instanceof AccessControlError) {
      redirect(`/${locale}/admin/unauthorized`);
    }
  }
}
