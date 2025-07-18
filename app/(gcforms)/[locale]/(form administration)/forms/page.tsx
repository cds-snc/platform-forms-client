import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { authCheckAndRedirect } from "@lib/actions";
import { AccessControlError } from "@lib/auth/errors";
import { redirect } from "next/navigation";
import { Navigation } from "./components/server/Navigation";
import { Cards } from "./components/server/Cards";
import { NewFormButton } from "./components/server/NewFormButton";
import { ResumeEditingForm } from "./components/ResumeEditingForm";
import { getAllTemplatesForUser, TemplateOptions } from "@lib/templates";
import { DeliveryOption } from "@lib/types";
import { getOverdueTemplateIds } from "@lib/overdue";
import { Invitations } from "./components/Invitations/Invitations";
import { prisma } from "@lib/integration/prismaConnector";

export type FormsTemplate = {
  id: string;
  titleEn: string;
  titleFr: string;
  deliveryOption: DeliveryOption;
  name: string;
  isPublished: boolean;
  date: string;
  url: string;
  overdue: boolean;
};

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("my-forms", { lang: locale });
  return {
    title: t("title"),
  };
}

export default async function Page(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const searchParams = await props.searchParams;

  const { status } = searchParams;

  const params = await props.params;

  const { locale } = params;

  try {
    const { session } = await authCheckAndRedirect();

    const { t } = await serverTranslation("my-forms", { lang: locale });

    // Moved from Cards to Page to avoid component being cached when navigating back to this page
    const options: TemplateOptions = {
      requestedWhere: {
        isPublished: status === "published" ? true : status === "draft" ? false : undefined,
      },
      sortByDateUpdated: "desc",
    };
    const templates = (await getAllTemplatesForUser(options)).map((template) => {
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
        overdue: false,
      };
    });

    const invitations = await prisma.invitation.findMany({
      where: {
        email: {
          equals: session.user.email,
          mode: "insensitive",
        },
        expires: {
          gt: new Date(),
        },
        template: {
          ttl: null,
        },
      },
      select: {
        id: true,
        email: true,
        expires: true,
        templateId: true,
      },
    });

    const overdueTemplateIds = await getOverdueTemplateIds(
      templates.map((template) => template.id)
    );

    return (
      <div className="mx-auto w-[980px]">
        <h1 className="mb-8 border-b-0">{t("title")}</h1>
        <Invitations invitations={invitations} />
        <div className="flex w-full justify-between">
          <Navigation filter={status} />
          <NewFormButton />
        </div>
        <ResumeEditingForm />
        <Cards templates={templates} overdueTemplateIds={overdueTemplateIds} />
      </div>
    );
  } catch (e) {
    if (e instanceof AccessControlError) {
      redirect(`/${locale}/admin/unauthorized`);
    }
  }
}
