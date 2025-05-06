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
        restrictDuplicates={true}
        validateTag={(tag) => {
          if (!tag || !isValidEmail(tag)) {
            return { isValid: false, errors: [t("input-validation.email")] };
          }
          return { isValid: true };
        }}
        label={t("share.emailLabel", { ns: "form-builder" })}
        description=""
        onTagAdd={(tag) => {
          setTags([...new Set([...tags, tag])]);
        }}
        onTagRemove={(tag) => {
          setTags(tags.filter((t) => t !== tag));
        }}
        tags={tags}
      />
    </section>
  );
};
