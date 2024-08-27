import { serverTranslation } from "@i18n";
import { ucfirst } from "@lib/client/clientHelpers";
import { Card } from "./Card";
import { FormsTemplate } from "../../page";

export const Cards = async ({
  filter,
  templates,
  overdueTemplateIds,
}: {
  filter?: string;
  templates: FormsTemplate[];
  overdueTemplateIds: string[];
}) => {
  const { t } = await serverTranslation("my-forms");

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
          <ol className="grid grid-cols-2 gap-4 p-0">
            {templates.map((card) => {
              // Check if the form has an overdue submission
              if (overdueTemplateIds.includes(card.id)) {
                card.overdue = 1;
              }

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
