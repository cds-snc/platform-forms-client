import { useTranslation } from "@i18n/client";
import { FormElement, FormElementTypes } from "@lib/types";
import { TagInput } from "@gcforms/tag-input";

export const QuestionTagOptions = ({
  item,
  setItem,
}: {
  item: FormElement;
  setItem: (item: FormElement) => void;
}) => {
  const { t } = useTranslation("form-builder");

  if (item.type === FormElementTypes.richText) {
    return null;
  }

  return (
    <section className="mb-4 mt-8">
      <TagInput
        label={t("moreDialog.tags.title")}
        description={t("moreDialog.tags.description")}
        onTagAdd={(tag) => {
          setItem({
            ...item,
            properties: {
              ...item.properties,
              tags: [...(item.properties.tags || []), tag],
            },
          });
        }}
        onTagRemove={(tag) => {
          setItem({
            ...item,
            properties: {
              ...item.properties,
              tags: (item.properties.tags || []).filter((t) => t !== tag),
            },
          });
        }}
        initialTags={item.properties.tags || []}
        restrictDuplicates={true}
        validateTag={(tag) => {
          let isValid = true;
          const errors: string[] = [];

          if (tag.length > 50) {
            isValid = false;
            errors.push(t("moreDialog.tags.errorTagTooLong"));
          }
          return { isValid, errors };
        }}
      />
    </section>
  );
};
