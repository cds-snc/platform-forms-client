import { serverTranslation } from "@i18n";
import { ucfirst } from "@lib/client/clientHelpers";
import { Card } from "./Card";
import { FormsTemplate } from "../../page";

export const Cards = async ({
  filter,
  templates,
  overdueTemplateIds,
  hasPublishFormsPrivilege,
}: {
  filter?: string;
  templates: FormsTemplate[];
  overdueTemplateIds: string[];
  hasPublishFormsPrivilege: boolean;
}) => {
  const { t } = await serverTranslation("my-forms");

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
                card.overdue = true;
              }

              // If this is a shared form and I don't have permissionToPublish, don't show it
              // @TODO: need to gate the form access itself as well!
              if (
                !hasPublishFormsPrivilege &&
                card.associatedUsersCount &&
                card.associatedUsersCount > 1
              ) {
                return null;
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
