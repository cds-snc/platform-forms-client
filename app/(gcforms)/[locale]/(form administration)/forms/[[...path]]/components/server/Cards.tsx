import { serverTranslation } from "@i18n";
import { getUnprocessedSubmissionsForUser } from "@lib/users";
import { getAllTemplates } from "@lib/templates";
import { DeliveryOption, UserAbility } from "@lib/types";
import { ucfirst } from "@lib/client/clientHelpers";
import { Card } from "./Card";

export interface CardI {
  id: string;
  titleEn: string;
  titleFr: string;
  deliveryOption: DeliveryOption;
  name: string;
  isPublished: boolean;
  date: string;
  url: string;
  overdue: number;
}

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
    }) as CardI[];

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
          <ol
            className="grid gap-4 p-0"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(27rem, 1fr))" }}
          >
            {templates.map((card) => {
              return (
                <li className="flex flex-col" key={card.id}>
                  <Card
                    id={`${card.id}`}
                    name={card.name}
                    titleEn={card.titleEn}
                    titleFr={card.titleFr}
                    url={card.url}
                    date={card.date}
                    isPublished={card.isPublished}
                    deliveryOption={card.deliveryOption || null}
                    overdue={card.overdue}
                    // TODO: remove once add server action to delete a form
                    cards={templates}
                  />
                </li>
              );
            })}
          </ol>
        ) : (
          <p>{t(`cards.no${ucfirst(filter || "")}Forms`)}</p>
        )}
      </div>
    </div>
  );
};
