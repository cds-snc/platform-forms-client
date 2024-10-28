import { useTranslation } from "@i18n/client";
import { LocalizedElementProperties } from "@lib/types/form-builder-types";
import { Label } from "./Label";
import { Input } from "@formBuilder/components/shared";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { FormElement } from "@lib/types";

export const Question = ({
  item,
  setItem,
}: {
  item: FormElement;
  setItem: (item: FormElement) => void;
}) => {
  const { t } = useTranslation("form-builder");

  const { localizeField, translationLanguagePriority } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  return (
    <div className="mb-2">
      <Label htmlFor={`titleEn--modal--${item.id}`}>{t("question")}</Label>
      <Input
        id={`title--modal--${item.id}`}
        name={`item${item.id}`}
        placeholder={t("question")}
        value={
          item.properties[
            localizeField(LocalizedElementProperties.TITLE, translationLanguagePriority)
          ]
        }
        className="w-11/12"
        onChange={(e) => {
          setItem({
            ...item,
            properties: {
              ...item.properties,
              ...{
                [localizeField(LocalizedElementProperties.TITLE, translationLanguagePriority)]:
                  e.target.value,
              },
            },
          });
        }}
      />
    </div>
  );
};
