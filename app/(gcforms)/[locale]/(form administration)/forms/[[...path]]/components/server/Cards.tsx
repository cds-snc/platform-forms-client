import { serverTranslation } from "@i18n";
import { getUnprocessedSubmissionsForUser } from "@lib/users";
import { getAllTemplates } from "@lib/templates";
import { UserAbility } from "@lib/types";
import { CardGrid } from "../client/CardGrid";
import { ucfirst } from "@lib/client/clientHelpers";

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

  // TODO: can this be done in the below DB call?
  const overdue = await getUnprocessedSubmissionsForUser(ability, id);

  const where = {
    isPublished: filter === "published" ? true : filter === "drafts" ? false : undefined,
  };
  const templates = (await getAllTemplates(ability, id, where))
    .map((template) => {
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
    })
    .map((template) => {
      // Mark any overdue templates
      if (overdue[template.id]) {
        template.overdue = overdue[template.id].numberOfSubmissions;
      }
      return template;
    })
    .sort((itemA, itemB) => {
      return new Date(itemB.date).getTime() - new Date(itemA.date).getTime();
    });

  // TODO: more testing with below live region. it may need to be placed higher in the tree
  return (
    <div aria-live="polite">
      <div
        id={`tabpanel-${filter}`}
        role="tabpanel"
        aria-labelledby={`tab-${filter}`}
        className={`pt-8`}
      >
        {templates && templates?.length > 0 ? (
          <CardGrid cards={templates} />
        ) : (
          <p>{t(`cards.no${ucfirst(filter || "")}Forms`)}</p>
        )}
      </div>
    </div>
  );
};
