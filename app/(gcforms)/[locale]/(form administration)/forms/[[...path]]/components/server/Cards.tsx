import { serverTranslation } from "@i18n";
import { getAllTemplates } from "@lib/templates";
import { UserAbility } from "@lib/types";
import { ucfirst } from "@lib/client/clientHelpers";
import { Card } from "./Card";

export const Cards = async ({ filter, ability }: { filter?: string; ability: UserAbility }) => {
  const {
    t,
    i18n: { language },
  } = await serverTranslation(["my-forms"]);

  const where = {
    isPublished: filter === "published" ? true : filter === "drafts" ? false : undefined,
  };
  const templates = (await getAllTemplates(ability, where)).map((template) => {
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

  // TODO: more testing with below live region. it may need to be placed higher in the tree
  return (
    <div aria-live="polite">
      <div
        id={`tabpanel-${filter}`}
        role="tabpanel"
        aria-labelledby={`tab-${filter}`}
        className={`pt-8`}
      >
        {templates.length > 0 ? (
          <ol
            className="grid gap-4 p-0"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(27rem, 1fr))" }}
          >
            {templates.map((card) => {
              return (
                <li className="flex flex-col" key={card.id}>
                  <Card card={card} />
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
