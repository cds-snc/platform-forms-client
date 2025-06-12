import { TagInput } from "@gcforms/tag-input";
import { useTranslation } from "@i18n/client";
import { isValidEmail } from "@lib/validation/isValidEmail";

export const EmailTags = ({
  tags,
  setTags,
}: {
  tags: string[];
  setTags: (tag: string[]) => void;
}) => {
  const { t } = useTranslation(["common", "form-builder"]);

  return (
    <section className="mb-4 mt-8">
      <TagInput
        validateTag={(tag) => {
          let isValid = true;
          const errors: string[] = [];

          if (!tag || !isValidEmail(tag)) {
            isValid = false;
            errors.push(t("input-validation.email"));
          }

          // Restrict duplicates
          if (tags.includes(tag)) {
            isValid = false;
            errors.push(t("input-validation.duplicateEmail"));
          }

          return { isValid, errors };
        }}
        label={t("share.emailLabel", { ns: "form-builder" })}
        description=""
        allowSpacesInTags={false}
        onTagAdd={(tag) => {
          setTags([...new Set([...tags, tag])]);
        }}
        onTagRemove={(tag) => {
          setTags(tags.filter((t) => t !== tag));
        }}
        initialTags={tags}
      />
    </section>
  );
};
