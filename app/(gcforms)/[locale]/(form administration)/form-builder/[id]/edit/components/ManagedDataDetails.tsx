import { Trans } from "react-i18next";
import { Tooltip } from "@formBuilder/components/shared/Tooltip";
import { FormElement, ElementProperties } from "@root/lib/types";
import { useTranslation } from "@root/i18n/client";

export const ManagedDataDetails = ({ item }: { item: FormElement }) => {
  const { t } = useTranslation("form-builder");
  // only rendered for combobox, so properties is narrowed accordingly
  const managedChoices = (item.properties as ElementProperties<"combobox">).managedChoices;

  return (
    <div data-testid={`managedChoices-${item.id}`} className="mt-5 text-sm">
      <div className="flex items-center">
        <strong>{t("managedList.prefix")}</strong>
        <Tooltip.Info side="top" triggerClassName="ml-1">
          <strong>{t("tooltips.departmentElement.title")}</strong>
          <Trans
            ns="form-builder"
            i18nKey="tooltips.departmentElement.body"
            defaults="<a></a> <p></p>"
            components={{ a: <a />, p: <p /> }}
          />
        </Tooltip.Info>
      </div>
      {Array.isArray(managedChoices) ? (
        <ul>
          {managedChoices.map((choice) => (
            <li key={choice}>{t(`managedList.${choice}`)}</li>
          ))}
        </ul>
      ) : (
        <a href="https://github.com/cds-snc/gc-organisations" className="ml-2" target="_blank">
          {t(`managedList.${managedChoices}`)}
        </a>
      )}
    </div>
  );
};
