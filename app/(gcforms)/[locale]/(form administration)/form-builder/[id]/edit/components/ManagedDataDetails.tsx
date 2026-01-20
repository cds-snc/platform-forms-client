import { Trans } from "react-i18next";
import { Tooltip } from "@formBuilder/components/shared/Tooltip";
import { FormElement } from "@root/lib/types";
import { useTranslation } from "@root/i18n/client";

export const ManagedDataDetails = ({ item }: { item: FormElement }) => {
  const { t } = useTranslation("form-builder");

  return (
    <div data-testid={`managedChoices-${item.id}`} className="mt-5 text-sm">
      <div>
        <strong>{t("managedList.prefix")}</strong>
        <Tooltip.Info side="top" triggerClassName="align-baseline ml-1">
          <strong>{t("tooltips.departmentElement.title")}</strong>
          <Trans
            ns="form-builder"
            i18nKey="tooltips.departmentElement.body"
            defaults="<a></a> <p></p>"
            components={{ a: <a />, p: <p /> }}
          />
        </Tooltip.Info>
      </div>
      {Array.isArray(item.properties.managedChoices) ? (
        <ul>
          {item.properties.managedChoices.map((choice) => (
            <li key={choice}>{t(`managedList.${choice}`)}</li>
          ))}
        </ul>
      ) : (
        <a href="https://github.com/cds-snc/gc-organisations" className="ml-2" target="_blank">
          {t(`managedList.${item.properties.managedChoices}`)}
        </a>
      )}
    </div>
  );
};
