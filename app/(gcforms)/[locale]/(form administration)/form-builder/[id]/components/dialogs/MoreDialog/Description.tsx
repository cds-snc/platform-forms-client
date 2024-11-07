import { useTranslation } from "@i18n/client";
import { LocalizedElementProperties } from "@lib/types/form-builder-types";
import { Label } from "./Label";
import { Hint } from "./Hint";
import { TextArea } from "@formBuilder/components/shared";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { FormElement } from "@lib/types";

export const Description = ({
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
      <Label>{t("inputDescription")}</Label>
      <Hint>{t("descriptionDescription")}</Hint>
      <TextArea
        id={`description--modal--${item.id}`}
        placeholder={t("inputDescription")}
        testId="description-input"
        className="w-11/12"
        onChange={(e) => {
          const description = e.target.value.replace(/[\r\n]/gm, "");
          setItem({
            ...item,
            properties: {
              ...item.properties,
              ...{
                [localizeField(
                  LocalizedElementProperties.DESCRIPTION,
                  translationLanguagePriority
                )]: description,
              },
            },
          });
        }}
        value={
          item.properties[
            localizeField(LocalizedElementProperties.DESCRIPTION, translationLanguagePriority)
          ]
        }
      />
    </div>
  );
};
