import { FormElement, FormElementTypes } from "@lib/types";
import { useTranslation } from "@root/i18n/client";
import { useState } from "react";

export const ManagedDataOptions = ({
  item,
  setItem,
}: {
  item: FormElement;
  setItem: (item: FormElement) => void;
}) => {
  const { t } = useTranslation("form-builder");
  let initialManagedChoices: string[] = [];

  if (typeof item.properties.managedChoices === "string") {
    initialManagedChoices = [item.properties.managedChoices];
  }

  if (Array.isArray(item.properties.managedChoices)) {
    initialManagedChoices = item.properties.managedChoices;
  }

  const [managedChoices, setManagedChoices] = useState<string[]>(initialManagedChoices);

  if (item.type !== FormElementTypes.combobox || !item.properties.managedChoices) {
    return null;
  }

  return (
    <section className="mb-4">
      <div className="mb-2">
        <h3>{t("managedList.managedListOptions")}</h3>
      </div>

      <div className="gc-input-checkbox">
        <input
          className="gc-input-checkbox__input"
          id={`md-options-${item.id}-departments`}
          type="checkbox"
          defaultChecked={managedChoices.includes("departments")}
          value={"departments"}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            let updatedChoices = [...managedChoices];
            if (e.target.checked) {
              updatedChoices.push(e.target.value);
            } else {
              updatedChoices = updatedChoices.filter((choice) => choice !== e.target.value);
            }
            setManagedChoices(updatedChoices);
            setItem({
              ...item,
              properties: {
                ...item.properties,
                managedChoices: updatedChoices,
              },
            });
          }}
        />
        <label
          data-testid="required"
          className="gc-checkbox-label"
          htmlFor={`md-options-${item.id}-departments`}
        >
          <span className="checkbox-label-text">{t("managedList.includeDepartments")}</span>
        </label>
      </div>

      <div className="gc-input-checkbox">
        <input
          className="gc-input-checkbox__input"
          id={`md-options-${item.id}-crownCorporations`}
          type="checkbox"
          defaultChecked={managedChoices.includes("crownCorporations")}
          value={"crownCorporations"}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            let updatedChoices = [...managedChoices];
            if (e.target.checked) {
              updatedChoices.push(e.target.value);
            } else {
              updatedChoices = updatedChoices.filter((choice) => choice !== e.target.value);
            }
            setManagedChoices(updatedChoices);
            setItem({
              ...item,
              properties: {
                ...item.properties,
                managedChoices: updatedChoices,
              },
            });
          }}
        />
        <label
          data-testid="required"
          className="gc-checkbox-label"
          htmlFor={`md-options-${item.id}-crownCorporations`}
        >
          <span className="checkbox-label-text">{t("managedList.includeCrownCorporations")}</span>
        </label>
      </div>

      <div className="gc-input-checkbox">
        <input
          className="gc-input-checkbox__input"
          id={`md-options-${item.id}-provincialTerritorial`}
          type="checkbox"
          defaultChecked={managedChoices.includes("provincialTerritorial")}
          value={"provincialTerritorial"}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            let updatedChoices = [...managedChoices];
            if (e.target.checked) {
              updatedChoices.push(e.target.value);
            } else {
              updatedChoices = updatedChoices.filter((choice) => choice !== e.target.value);
            }
            setManagedChoices(updatedChoices);
            setItem({
              ...item,
              properties: {
                ...item.properties,
                managedChoices: updatedChoices,
              },
            });
          }}
        />
        <label
          data-testid="required"
          className="gc-checkbox-label"
          htmlFor={`md-options-${item.id}-provincialTerritorial`}
        >
          <span className="checkbox-label-text">
            {t("managedList.includeProvincialTerritorial")}
          </span>
        </label>
      </div>
    </section>
  );
};
