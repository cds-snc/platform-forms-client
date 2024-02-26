import { serverTranslation } from "@i18n";
import { getUnprocessedSubmissionsForUser } from "@lib/users";
import { getAllTemplates } from "@lib/templates";
import { UserAbility } from "@lib/types";
import { CardGrid } from "../client/CardGrid";

export const Cards = async ({
  filter,
  ability,
  id,
}: {
  filter?: string;
  ability: UserAbility;
  id: string;
}) => {
  const {
    t,
    i18n: { language },
  } = await serverTranslation(["my-forms", "form-builder"]);

  const templates = (await getAllTemplates(ability, id)).map((template) => {
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
      url: `/${language}/id/${id}`,
      overdue: 0,
    };
  });

  const overdue = await getUnprocessedSubmissionsForUser(ability, id);

  templates.forEach((template) => {
    if (overdue[template.id]) {
      template.overdue = overdue[template.id].numberOfSubmissions;
    }
  });

  const templatesAll = templates.sort((itemA, itemB) => {
    return new Date(itemB.date).getTime() - new Date(itemA.date).getTime();
  });

  const templatesPublished = templatesAll?.filter((item) => item?.isPublished === true);

  const templatesDrafts = templatesAll?.filter((item) => item?.isPublished === false);

  return (
    <div aria-live="polite">
      <div
        id="tabpanel-drafts"
        role="tabpanel"
        aria-labelledby="tab-drafts"
        className={`pt-8 ${filter === "drafts" ? "" : "hidden"}`}
      >
        {templatesDrafts && templatesDrafts?.length > 0 ? (
          <CardGrid cards={templatesDrafts} gridType="drafts" />
        ) : (
          <p>{t("cards.noDraftForms")}</p>
        )}
      </div>
      <div
        id="tabpanel-published"
        role="tabpanel"
        aria-labelledby="tab-published"
        className={`pt-8 ${filter === "published" ? "" : "hidden"}`}
      >
        {templatesPublished && templatesPublished?.length > 0 ? (
          <CardGrid cards={templatesPublished} gridType="published" />
        ) : (
          <p>{t("cards.noPublishedForms")}</p>
        )}
      </div>
      <div
        id="tabpanel-all"
        role="tabpanel"
        aria-labelledby="tab-all"
        className={`pt-8 ${filter === "all" || typeof filter === "undefined" ? "" : "hidden"}`}
      >
        {templatesAll && templatesAll?.length > 0 ? (
          <CardGrid cards={templatesAll} gridType="all" />
        ) : (
          <p>{t("cards.noForms")}</p>
        )}
      </div>
    </div>
  );
};
