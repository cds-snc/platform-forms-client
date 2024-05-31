import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { authCheckAndThrow } from "@lib/actions";

import { notFound } from "next/navigation";
import { getFullTemplateByID } from "@lib/templates";
import { Preview } from "./Preview";
import { LockIcon } from "@serverComponents/icons";
import Markdown from "markdown-to-jsx";
import { allowGrouping } from "@formBuilder/components/shared/right-panel/treeview/util/allowGrouping";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("gcFormsEdit")} — ${t("gcForms")}`,
  };
}

export default async function Page({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  const { session, ability } = await authCheckAndThrow().catch(() => ({
    session: null,
    ability: null,
  }));
  const disableSubmit = id === "0000" || !session?.user;
  const { t } = await serverTranslation("form-builder", { lang: locale });
  const isAllowGrouping = await allowGrouping();

  const formID = id;

  if (!session?.user && formID !== "0000") {
    return notFound();
  }

  let isPublished = false;

  if (session) {
    try {
      const initialForm = ability && (await getFullTemplateByID(ability, id));
      isPublished = initialForm?.isPublished || false;
    } catch (e) {
      // no-op
    }
  }

  if (isPublished) {
    return (
      <div className="my-5 flex bg-purple-200 p-5">
        <div className="flex">
          <div className="pr-7">
            <LockIcon className="mb-2 scale-125" />
          </div>
          <div>
            <Markdown options={{ forceBlock: true }}>
              {t("previewDisabledForPublishedForm", { ns: "form-builder" })}
            </Markdown>
          </div>
        </div>
      </div>
    );
  }

  return <Preview disableSubmit={disableSubmit} allowGrouping={isAllowGrouping} />;
}
