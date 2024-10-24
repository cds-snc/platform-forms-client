import { useTranslation } from "@i18n/client";
import { FormElementWithIndex, LocalizedElementProperties } from "@lib/types/form-builder-types";
import { ModalLabel } from "./ModalLabel";
import { Input } from "@formBuilder/components/shared";
import { useTemplateStore } from "@lib/store/useTemplateStore";

export const Question = ({
  item,
  setItem,
}: {
  item: FormElementWithIndex;
  setItem: (item: FormElementWithIndex) => void;
}) => {
  const { t } = useTranslation("form-builder");

  const { localizeField, translationLanguagePriority } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  return (
    <div className="mb-2">
      <ModalLabel htmlFor={`titleEn--modal--${item.index}`}>{t("question")}</ModalLabel>
      <Input
        id={`title--modal--${item.index}`}
        name={`item${item.index}`}
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
