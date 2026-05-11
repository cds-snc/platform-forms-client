"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@i18n/client";
import { FormElementTypes, FormElement } from "@lib/types";
import { InfoDetails } from "@formBuilder/components/shared/InfoDetails";
import { ErrorMessage } from "@clientComponents/forms";
import { LabelledInput } from "../../../../components/shared/LabelledInput";

export const NumberFieldOptions = ({
  item,
  setItem,
  setIsValid,
}: {
  item: FormElement;
  setItem: (item: FormElement) => void;
  setIsValid: (isValid: boolean) => void;
}) => {
  const { t } = useTranslation("form-builder");

  const isCurrency = !!item.properties.currencyCode;
  const [decimalsEnabled, setDecimalsEnabled] = useState(
    isCurrency || (typeof item.properties.stepCount === "number" && item.properties.stepCount > 0)
  );
  const [valueRangeEnabled, setValueRangeEnabled] = useState(
    typeof item.properties.validation?.minValue === "number" ||
      typeof item.properties.validation?.maxValue === "number"
  );
  const [digitLimitEnabled, setDigitLimitEnabled] = useState(
    typeof item.properties.validation?.minDigits === "number" ||
      typeof item.properties.validation?.maxDigits === "number"
  );
  const showDecimals = isCurrency || decimalsEnabled;

  const hasInvalidValueRange = useMemo(() => {
    if (!valueRangeEnabled) {
      return false;
    }

    const minValue = item.properties.validation?.minValue;
    const maxValue = item.properties.validation?.maxValue;

    return typeof minValue === "number" && typeof maxValue === "number" && minValue >= maxValue;
  }, [
    item.properties.validation?.maxValue,
    item.properties.validation?.minValue,
    valueRangeEnabled,
  ]);

  const hasInvalidDigitRange = useMemo(() => {
    if (!digitLimitEnabled) {
      return false;
    }

    const minDigits = item.properties.validation?.minDigits;
    const maxDigits = item.properties.validation?.maxDigits;

    return typeof minDigits === "number" && typeof maxDigits === "number" && minDigits >= maxDigits;
  }, [
    item.properties.validation?.maxDigits,
    item.properties.validation?.minDigits,
    digitLimitEnabled,
  ]);

  const isValid = useMemo(
    () => !hasInvalidValueRange && !hasInvalidDigitRange,
    [hasInvalidDigitRange, hasInvalidValueRange]
  );

  useEffect(() => {
    setIsValid(isValid);
  }, [isValid, setIsValid]);

  if (item.type !== FormElementTypes.numberInput) {
    return null;
  }

  return (
    <section className="mb-4">
      <InfoDetails
        className="mt-4 text-2xl font-semibold"
        summary={t("addElementDialog.number.setNumberFormat")}
      >
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
                  useThousandsSeparator: e.target.checked,
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
            id={`numberField-${item.id}-id-thousandsSeparator`}
            checked={isCurrency || !!item.properties.useThousandsSeparator}
            disabled={isCurrency}
            aria-disabled={isCurrency}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const useThousandsSeparator = e.target.checked;
              setItem({
                ...item,
                properties: {
                  ...item.properties,
                  useThousandsSeparator,
                },
              });
            }}
          />
          <label
            data-testid="thousandsSeparator"
            className="gc-checkbox-label"
            htmlFor={`numberField-${item.id}-id-thousandsSeparator`}
          >
            <span className="checkbox-label-text">
              {t("addElementDialog.number.thousandsSeparator")}
            </span>
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
          <div className="mb-4">
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
        <div className="gc-input-checkbox mb-4">
          <input
            type="checkbox"
            className="gc-input-checkbox__input"
            id={`numberField-${item.id}-id-valueRange`}
            checked={valueRangeEnabled}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const enabled = e.target.checked;
              setValueRangeEnabled(enabled);

              if (!enabled) {
                setItem({
                  ...item,
                  properties: {
                    ...item.properties,
                    validation: {
                      required: false,
                      ...item.properties.validation,
                      minValue: undefined,
                      maxValue: undefined,
                    },
                  },
                });
              }
            }}
          />
          <label
            data-testid="valueRange"
            className="gc-checkbox-label"
            htmlFor={`numberField-${item.id}-id-valueRange`}
          >
            <span className="checkbox-label-text">
              {t("addElementDialog.number.addValueRange")}
            </span>
          </label>
        </div>
        {valueRangeEnabled && (
          <div className="mb-4">
            <h3 className="mt-4">{t("addElementDialog.number.valueRange")}</h3>
            <div className="mt-4 flex flex-row gap-4">
              <LabelledInput classNames="w-1/2" label={t("addElementDialog.number.minShort")}>
                <input
                  type="number"
                  className={
                    "gc-input-text mt-0!" +
                    (hasInvalidValueRange ? " border-red-700! outline-2 outline-red-700!" : "")
                  }
                  id={`numberField-${item.id}-id-minValue`}
                  aria-invalid={hasInvalidValueRange}
                  aria-describedby={
                    hasInvalidValueRange ? `numberField-${item.id}-error-valueRange` : undefined
                  }
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const minValue = e.target.value !== "" ? parseFloat(e.target.value) : undefined;
                    setItem({
                      ...item,
                      properties: {
                        ...item.properties,
                        validation: {
                          required: false,
                          ...item.properties.validation,
                          minValue,
                        },
                      },
                    });
                  }}
                  value={item.properties.validation?.minValue ?? ""}
                />
              </LabelledInput>
              <LabelledInput classNames="w-1/2" label={t("addElementDialog.number.maxShort")}>
                <input
                  type="number"
                  className={
                    "gc-input-text mt-0!" +
                    (hasInvalidValueRange ? " border-red-700! outline-2 outline-red-700!" : "")
                  }
                  id={`numberField-${item.id}-id-maxValue`}
                  aria-invalid={hasInvalidValueRange}
                  aria-describedby={
                    hasInvalidValueRange ? `numberField-${item.id}-error-valueRange` : undefined
                  }
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const maxValue = e.target.value !== "" ? parseFloat(e.target.value) : undefined;
                    setItem({
                      ...item,
                      properties: {
                        ...item.properties,
                        validation: {
                          required: false,
                          ...item.properties.validation,
                          maxValue,
                        },
                      },
                    });
                  }}
                  value={item.properties.validation?.maxValue ?? ""}
                />
              </LabelledInput>
            </div>
            {hasInvalidValueRange && (
              <ErrorMessage id={`numberField-${item.id}-error-valueRange`}>
                {t("addElementDialog.number.invalidValueRange")}
              </ErrorMessage>
            )}
          </div>
        )}
        <div className="gc-input-checkbox mb-4">
          <input
            type="checkbox"
            className="gc-input-checkbox__input"
            id={`numberField-${item.id}-id-digitLimit`}
            checked={digitLimitEnabled}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const enabled = e.target.checked;
              setDigitLimitEnabled(enabled);

              if (!enabled) {
                setItem({
                  ...item,
                  properties: {
                    ...item.properties,
                    validation: {
                      required: false,
                      ...item.properties.validation,
                      minDigits: undefined,
                      maxDigits: undefined,
                    },
                  },
                });
              }
            }}
          />
          <label
            data-testid="digitLimit"
            className="gc-checkbox-label"
            htmlFor={`numberField-${item.id}-id-digitLimit`}
          >
            <span className="checkbox-label-text">
              {t("addElementDialog.number.limitNumberOfDigits")}
            </span>
          </label>
        </div>
        {digitLimitEnabled && (
          <div className="mb-4">
            <h3 className="mt-4">{t("addElementDialog.number.numberOfDigits")}</h3>
            <div className="mt-4 flex flex-row gap-4">
              <LabelledInput classNames="w-1/2" label={t("addElementDialog.number.minShort")}>
                <input
                  type="number"
                  className={
                    "gc-input-text mt-0!" +
                    (hasInvalidDigitRange ? " border-red-700! outline-2 outline-red-700!" : "")
                  }
                  id={`numberField-${item.id}-id-minDigits`}
                  aria-invalid={hasInvalidDigitRange}
                  aria-describedby={
                    hasInvalidDigitRange ? `numberField-${item.id}-error-digitRange` : undefined
                  }
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const minDigits =
                      e.target.value !== "" ? parseInt(e.target.value, 10) : undefined;
                    setItem({
                      ...item,
                      properties: {
                        ...item.properties,
                        validation: {
                          required: false,
                          ...item.properties.validation,
                          minDigits,
                        },
                      },
                    });
                  }}
                  value={item.properties.validation?.minDigits ?? ""}
                  min={1}
                  step={1}
                />
              </LabelledInput>
              <LabelledInput classNames="w-1/2" label={t("addElementDialog.number.maxShort")}>
                <input
                  type="number"
                  className={
                    "gc-input-text mt-0!" +
                    (hasInvalidDigitRange ? " border-red-700! outline-2 outline-red-700!" : "")
                  }
                  id={`numberField-${item.id}-id-maxDigits`}
                  aria-invalid={hasInvalidDigitRange}
                  aria-describedby={
                    hasInvalidDigitRange ? `numberField-${item.id}-error-digitRange` : undefined
                  }
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const maxDigits =
                      e.target.value !== "" ? parseInt(e.target.value, 10) : undefined;
                    setItem({
                      ...item,
                      properties: {
                        ...item.properties,
                        validation: {
                          required: false,
                          ...item.properties.validation,
                          maxDigits,
                        },
                      },
                    });
                  }}
                  value={item.properties.validation?.maxDigits ?? ""}
                  min={1}
                  step={1}
                />
              </LabelledInput>
            </div>
            {hasInvalidDigitRange && (
              <ErrorMessage id={`numberField-${item.id}-error-digitRange`}>
                {t("addElementDialog.number.invalidDigitRange")}
              </ErrorMessage>
            )}
          </div>
        )}
      </InfoDetails>
    </section>
  );
};
