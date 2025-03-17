import { type Language } from "@lib/types/form-builder-types";
import { type FormItem, type ReviewSection } from "./helpers";
import { type Theme } from "@clientComponents/globals/Buttons/themes";

import { FormItemFactory } from "./FormItemFactory";

export const ReviewList = ({
  language,
  reviewItems,
  renderEditButton,
  startSectionTitle,
}: {
  language: Language;
  reviewItems: ReviewSection[];
  groupsHeadingRef?: React.RefObject<HTMLHeadingElement | null>;
  renderEditButton?: ({
    id,
    title,
    theme,
  }: {
    id: string;
    title?: string;
    theme: Theme;
  }) => React.ReactElement;
  startSectionTitle: string;
}): React.ReactElement => {
  return (
    <>
      <div className="my-16">
        {Array.isArray(reviewItems) &&
          reviewItems.map((reviewItem) => {
            const title = reviewItem.id === "start" ? startSectionTitle : reviewItem.title;
            const editLink = renderEditButton
              ? renderEditButton({ id: reviewItem.id, title: title, theme: "link" })
              : null;

            const editButton = renderEditButton
              ? renderEditButton({ id: reviewItem.id, theme: "secondary" })
              : null;

            return (
              <div
                key={reviewItem.id}
                className="mb-10 rounded-lg border-2 border-slate-400 px-6 py-4"
              >
                <h3 className="text-slate-700">{editLink ? editLink : title}</h3>
                <div className="mb-10 ml-1">
                  {reviewItem.formItems &&
                    reviewItem.formItems.map((formItem: FormItem) => (
                      <FormItemFactory
                        key={formItem.element?.id}
                        formItem={formItem}
                        language={language}
                      />
                    ))}
                </div>
                {editButton && editButton}
              </div>
            );
          })}
      </div>
    </>
  );
};
