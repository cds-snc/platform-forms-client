import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { AccessControlError } from "@lib/auth/errors";
import { redirect } from "next/navigation";
import { prisma } from "@lib/integration/prismaConnector";
import { AliasForm } from "./client";
import { getAllTemplatesForUser } from "@lib/templates";
import { getOrigin } from "@lib/origin";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("my-forms", { lang: locale });
  return {
    title: t("aliases.title"),
  };
}

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;

  const { locale } = params;

  const HOST = await getOrigin();

  try {
    const { t } = await serverTranslation("my-forms", { lang: locale });

    const aliases = await prisma.formAlias.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const templates = await getAllTemplatesForUser();

    let templatesWithTitle = templates.map((template) => {
      return {
        id: template.id,
      };
    });

    if (!templatesWithTitle.length) {
      templatesWithTitle = [{ id: "" }];
    }

    return (
      <div className="mx-auto w-[980px]">
        <h1 className="mb-8 border-b-0">{t("aliases.title")}</h1>
        <AliasForm HOST={HOST} aliases={aliases} templates={templatesWithTitle} />
      </div>
    );
  } catch (e) {
    if (e instanceof AccessControlError) {
      redirect(`/${locale}/admin/unauthorized`);
    }
  }
}
