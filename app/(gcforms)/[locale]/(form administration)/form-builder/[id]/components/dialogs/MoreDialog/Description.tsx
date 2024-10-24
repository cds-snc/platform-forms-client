import { useTranslation } from "@i18n/client";
import { FormElementWithIndex, LocalizedElementProperties } from "@lib/types/form-builder-types";
import { ModalLabel } from "./ModalLabel";
import { Hint } from "./Hint";
import { TextArea } from "@formBuilder/components/shared";
import { useTemplateStore } from "@lib/store/useTemplateStore";

export const Description = ({
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
      <ModalLabel>{t("inputDescription")}</ModalLabel>
      <Hint>{t("descriptionDescription")}</Hint>
      <TextArea
        id={`description--modal--${item.index}`}
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
