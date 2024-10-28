import { useTranslation } from "@i18n/client";
import { AutocompleteDropdown } from "./AutocompleteDropdown";
import { InfoDetails } from "@formBuilder/components/shared/InfoDetails";
import { FormElement, FormElementTypes } from "@lib/types";
import { ModalLabel } from "./ModalLabel";
import { Hint } from "./Hint";

export const TextFieldOptions = ({
  item,
  setItem,
}: {
  item: FormElement;
  setItem: (item: FormElement) => void;
}) => {
  const { t } = useTranslation("form-builder");
  const autocompleteSelectedValue = item.properties.autoComplete || "";

  if (item.type !== FormElementTypes.textField) {
    return null;
  }

  return (
    <section className="mb-4 mt-8">
      <ModalLabel htmlFor="">{t("selectAutocomplete")}</ModalLabel>
      <Hint>{t("selectAutocompleteHint")}</Hint>
      <div>
        <AutocompleteDropdown
          handleChange={(e) => {
            setItem({
              ...item,
              properties: {
                ...item.properties,
                ...{ autoComplete: e.target.value },
              },
            });
          }}
          selectedValue={autocompleteSelectedValue as string}
        />{" "}
        <InfoDetails summary={t("autocompleteWhenNotToUse.title")}>
          <div className="mb-8 mt-4 border-l-3 border-gray-500 pl-8">
            <p className="mb-4 text-sm">{t("autocompleteWhenNotToUse.text1")}</p>
            <p className="text-sm">{t("autocompleteWhenNotToUse.text2")}</p>
          </div>
        </InfoDetails>
      </div>
    </section>
  );
};
