"use client";
import { useState } from "react";
import { useTranslation } from "@i18n/client";
import { FormElementTypes, FormElement } from "@lib/types";
import { InfoDetails } from "@formBuilder/components/shared/InfoDetails";
import { LabelledInput } from "../../../../components/shared/LabelledInput";

export const NumberFieldOptions = ({
  item,
  setItem,
}: {
  item: FormElement;
  setItem: (item: FormElement) => void;
}) => {
  const { t } = useTranslation("form-builder");

  const isCurrency = !!item.properties.currencyCode;
  const [decimalsEnabled, setDecimalsEnabled] = useState(
    isCurrency || (typeof item.properties.stepCount === "number" && item.properties.stepCount > 0)
  );
  const showDecimals = isCurrency || decimalsEnabled;

  if (item.type !== FormElementTypes.textField) {
    return null;
  }

  if (!item.properties.validation || item.properties.validation.type !== "number") {
    return null;
  }

  return (
    <section className="mb-4">
      <InfoDetails className="mt-4" summary={t("Set number format")}>
        <div className="gc-input-checkbox mb-4">
          <input
            type="checkbox"
            className="gc-input-checkbox__input"
            id={`numberField-${item.id}-id-allowNegative`}
            value={
              `numberField-${item.id}-value-allowNegative-` + item.properties.allowNegativeNumbers
            }
            defaultChecked={item.properties.allowNegativeNumbers}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const allowNegativeNumbers = e.target.checked;
              setItem({
                ...item,
                properties: {
                  ...item.properties,
                  allowNegativeNumbers,
                },
              });
            }}
          />
          <label
            data-testid="allowNegative"
            className="gc-checkbox-label"
            htmlFor={`numberField-${item.id}-id-allowNegative`}
          >
            <span className="checkbox-label-text">
              {t("addElementDialog.number.allowNegative")}
            </span>
          </label>
        </div>
        <div className="gc-input-checkbox mb-4">
          <input
            type="checkbox"
            className="gc-input-checkbox__input"
            id={`numberField-${item.id}-id-currencyCode`}
            defaultChecked={isCurrency}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const currencyCode = e.target.checked ? "CAD" : undefined;
              setItem({
                ...item,
                properties: {
                  ...item.properties,
                  currencyCode,
                  stepCount: e.target.checked ? 2 : item.properties.stepCount,
                },
              });
            }}
          />
          <label
            data-testid="currencyCode"
            className="gc-checkbox-label"
            htmlFor={`numberField-${item.id}-id-currencyCode`}
          >
            <span className="checkbox-label-text">{t("addElementDialog.number.currency")}</span>
          </label>
        </div>
        <div className="gc-input-checkbox mb-4">
          <input
            type="checkbox"
            className="gc-input-checkbox__input"
            id={`numberField-${item.id}-id-decimals`}
            checked={showDecimals}
            disabled={isCurrency}
            aria-disabled={isCurrency}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setDecimalsEnabled(e.target.checked);
              setItem({
                ...item,
                properties: {
                  ...item.properties,
                  stepCount: e.target.checked ? 1 : 0,
                },
              });
            }}
          />
          <label
            data-testid="decimals"
            className="gc-checkbox-label"
            htmlFor={`numberField-${item.id}-id-decimals`}
          >
            <span className="checkbox-label-text">{t("addElementDialog.number.decimals")}</span>
          </label>
        </div>
        {showDecimals && (
          <div>
            <label
              data-testid="stepCount"
              className="gcds-label mt-1"
              htmlFor={`numberField-${item.id}-id-stepCount`}
            >
              {t("addElementDialog.number.decimalPlaces")}
            </label>
            <input
              type="number"
              className="gc-input-text mt-2"
              id={`numberField-${item.id}-id-stepCount`}
              disabled={isCurrency}
              aria-disabled={isCurrency}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const parsed = parseInt(e.target.value, 10);
                const stepCount = isNaN(parsed) ? undefined : parsed;
                setItem({
                  ...item,
                  properties: {
                    ...item.properties,
                    stepCount,
                  },
                });
              }}
              value={
                isCurrency
                  ? 2
                  : typeof item.properties.stepCount === "number"
                    ? item.properties.stepCount
                    : ""
              }
              min={1}
              step={1}
            />
          </div>
        )}
      </InfoDetails>

      <InfoDetails className="mt-4" summary={t("Set a range")}>
        <h3 className="mt-4">Value</h3>
        <div className="mt-4 flex flex-row gap-4">
          <LabelledInput classNames="w-1/2" label="Min" id={`numberField-${item.id}-id-numberMin`}>
            <input
              type="number"
              className="gc-input-text mt-0"
              id={`numberField-${item.id}-id-numberMin`}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const numberMin = e.target.value !== "" ? parseFloat(e.target.value) : undefined;
                setItem({
                  ...item,
                  properties: {
                    ...item.properties,
                    numberMin,
                  },
                });
              }}
              value={item.properties.numberMin ?? ""}
            />
          </LabelledInput>
          <LabelledInput classNames="w-1/2" label="Max" id={`numberField-${item.id}-id-numberMax`}>
            <input
              type="number"
              className="gc-input-text mt-0"
              id={`numberField-${item.id}-id-numberMax`}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const numberMax = e.target.value !== "" ? parseFloat(e.target.value) : undefined;
                setItem({
                  ...item,
                  properties: {
                    ...item.properties,
                    numberMax,
                  },
                });
              }}
              value={item.properties.numberMax ?? ""}
            />
          </LabelledInput>
        </div>

        <h3 className="mt-4">Number of Digits</h3>
        <div className="mt-4 flex flex-row gap-4">
          <LabelledInput classNames="w-1/2" label="Min" id={`numberField-${item.id}-id-minDigits`}>
            <input
              type="number"
              className="gc-input-text mt-0"
              id={`numberField-${item.id}-id-minDigits`}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const minDigits = e.target.value !== "" ? parseInt(e.target.value, 10) : undefined;
                setItem({
                  ...item,
                  properties: {
                    ...item.properties,
                    minDigits,
                  },
                });
              }}
              value={item.properties.minDigits ?? ""}
              min={1}
              step={1}
            />
          </LabelledInput>
          <LabelledInput classNames="w-1/2" label="Max" id={`numberField-${item.id}-id-maxDigits`}>
            <input
              type="number"
              className="gc-input-text mt-0"
              id={`numberField-${item.id}-id-maxDigits`}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const maxDigits = e.target.value !== "" ? parseInt(e.target.value, 10) : undefined;
                setItem({
                  ...item,
                  properties: {
                    ...item.properties,
                    maxDigits,
                  },
                });
              }}
              value={item.properties.maxDigits ?? ""}
              min={1}
              step={1}
            />
          </LabelledInput>
        </div>
      </InfoDetails>
    </section>
  );
};
