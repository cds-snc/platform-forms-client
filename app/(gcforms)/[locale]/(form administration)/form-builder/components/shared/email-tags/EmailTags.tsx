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
  const { t } = useTranslation("form-builder");
  return (
    <section className="mb-4 mt-8">
      <TagInput
        validateTag={(tag) => {
          if (!tag) return { isValid: false, message: "" };
          if (tags.includes(tag)) {
            return { isValid: false, message: "" };
          }
          if (!isValidEmail(tag)) {
            return { isValid: false, message: "" };
          }
          return { isValid: true, message: "" };
        }}
        label={t("share.emailLabel")}
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
