import { serverTranslation } from "@i18n";
import { ucfirst } from "@lib/client/clientHelpers";
import { Card } from "./Card";
import { FormsTemplate } from "../../page";

export const Cards = async ({
  filter,
  templates,
}: {
  filter?: string;
  templates: FormsTemplate[];
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
          <ol className="grid gap-4 grid-cols-2 p-0">
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
