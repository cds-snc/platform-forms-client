"use client";

import { Button } from "@clientComponents/globals";
import { useResponsesContext } from "../context/ResponsesContext";
import { Radio } from "../../../components/shared/MultipleChoice";
import { useRouter } from "next/navigation";
import { useTranslation } from "@root/i18n/client";
import { useCallback } from "react";

export const SelectFormat = ({ locale, id }: { locale: string; id: string }) => {
  const { t } = useTranslation("response-api");

  const { setSelectedFormat, selectedFormat, retrieveResponses, processResponses } =
    useResponsesContext();

  const router = useRouter();

  const handleBack = () => {
    // @TODO
  };

  const handleNext = useCallback(async () => {
    const initialResponses = await retrieveResponses();

    processResponses(initialResponses);

    router.push(`/${locale}/form-builder/${id}/responses-beta/processing`);
  }, [retrieveResponses, processResponses, router, locale, id]);

  const handleFormatChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const value = evt.target.value;
      setSelectedFormat(value);
    },
    [setSelectedFormat]
  );

  return (
    <div>
      <div className="mb-4">{t("stepOf", { current: 3, total: 3 })}</div>
      <h1>{t("formatPage.title")}</h1>
      <div>
        <p>
          <strong>{t("formatPage.subheading")}</strong>
        </p>
        <p>{t("formatPage.detail")}</p>
        <div className="form-builder my-6">
          <Radio
            name="format"
            id="format-csv"
            value="csv"
            label={t("formatPage.formatOptions.csv.label")}
            hint={t("formatPage.formatOptions.csv.hint")}
            onChange={handleFormatChange}
          />
          <Radio
            name="format"
            id="format-html"
            value="html"
            label={t("formatPage.formatOptions.html.label")}
            onChange={handleFormatChange}
          />
        </div>
      </div>
      <div className="flex flex-row gap-4">
        <Button theme="secondary" onClick={handleBack}>
          {t("backButton")}
        </Button>
        <Button theme="primary" disabled={!selectedFormat} onClick={handleNext}>
          {t("continueButton")}
        </Button>
      </div>
    </div>
  );
};
