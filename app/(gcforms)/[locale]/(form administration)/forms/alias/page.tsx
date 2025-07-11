import { Metadata } from "next";
import { redirect } from "next/navigation";

import { serverTranslation } from "@i18n";
import { AccessControlError } from "@lib/auth/errors";
import { prisma } from "@lib/integration/prismaConnector";
import { AliasForm } from "./client";
import { getAllTemplatesForUser } from "@lib/templates";
import { getOrigin } from "@lib/origin";

import { type TemplateOptions } from "@lib/templates";
import { type Language } from "@lib/types/form-builder-types";

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

    const options: TemplateOptions = {
      requestedWhere: {
        isPublished: true,
      },
      sortByDateUpdated: "desc",
    };

    const templates = await getAllTemplatesForUser(options);

    let templatesWithTitle = templates.map((template) => {
      return {
        id: template.id,
        name: template.name,
      };
    });

    if (!templatesWithTitle.length) {
      templatesWithTitle = [{ id: "", name: "ya" }];
    }

    const aliases = await prisma.formAlias.findMany({
      where: {
        formId: {
          in: templatesWithTitle.map((template) => template.id),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return (
      <div className="mx-auto w-[980px]">
        <h1 className="mb-8 border-b-0">{t("aliases.title")}</h1>
        <AliasForm
          locale={locale as Language}
          HOST={HOST}
          aliases={aliases}
          templates={templatesWithTitle}
        />
      </div>
    );
  } catch (e) {
    if (e instanceof AccessControlError) {
      redirect(`/${locale}/admin/unauthorized`);
    }
  }
}
