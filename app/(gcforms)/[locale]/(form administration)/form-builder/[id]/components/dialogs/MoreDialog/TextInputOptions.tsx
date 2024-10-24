import { FormElementWithIndex } from "@lib/types/form-builder-types";
import { Hint, ModalLabel } from "./ModalForm";
import { useTranslation } from "@i18n/client";
import { AutocompleteDropdown } from "./AutocompleteDropdown";
import { InfoDetails } from "@formBuilder/components/shared/InfoDetails";

export const TextInputOptions = ({
  item,
  setItem,
}: {
  item: FormElementWithIndex;
  setItem: (item: FormElementWithIndex) => void;
}) => {
  const { t } = useTranslation("form-builder");
  const autocompleteSelectedValue = item.properties.autoComplete || "";

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
