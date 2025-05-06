import { serverTranslation } from "@i18n";
import { Publish } from "./Publish";
import { Language } from "@lib/types/form-builder-types";

export const PublishCard = async ({ id, locale }: { id: string; locale: Language }) => {
  const { t } = await serverTranslation("form-builder", { lang: locale });
  return (
    <div className="rounded-lg border-1 p-5">
      <h1 className="mb-2 border-0">{t("publishYourForm")}</h1>
      <p className="mb-0 text-lg">{t("publishYourFormInstructions.text1")}</p>
      <Publish id={id} />
    </div>
  );
};
