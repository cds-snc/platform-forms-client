"use client";

import { Button } from "@clientComponents/globals";
import { useResponsesApp } from "../context";
import { useResponsesContext } from "../context/ResponsesContext";
import { Radio } from "../../../components/shared/MultipleChoice";

import { useCallback } from "react";
import { LinkButton } from "@root/components/serverComponents/globals/Buttons/LinkButton";
import { FocusHeader } from "@root/app/(gcforms)/[locale]/(support)/components/client/FocusHeader";
import { getStepOf } from "../lib/getStepOf";

export const SelectFormat = ({ locale, id }: { locale: string; id: string }) => {
  const { t, router } = useResponsesApp();
  const { setSelectedFormat, selectedFormat, retrieveResponses, processResponses, logger } =
    useResponsesContext();

  const handleNext = useCallback(async () => {
    logger.info("Starting retrieval of form submissions");

    const initialResponses = await retrieveResponses();

    logger.info(`Retrieved ${initialResponses.length} form submissions`);

    processResponses(initialResponses);

    router.push(`/${locale}/form-builder/${id}/responses-pilot/processing`);
  }, [logger, retrieveResponses, processResponses, router, locale, id]);

  const handleFormatChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const value = evt.target.value;
      setSelectedFormat(value);
    },
    [setSelectedFormat]
  );

  return (
    <div>
      <div className="mb-4" data-testid="step-indicator">
        {t("stepOf", getStepOf("format"))}
      </div>
      <FocusHeader headingTag="h2" dataTestId="format-page-title">
        {t("formatPage.title")}
      </FocusHeader>
      <div>
        <p>
          <strong>{t("formatPage.subheading")}</strong>
        </p>
        <p>{t("formatPage.detail")}</p>
        <div className="form-builder my-6">
          <Radio
            name="format"
            id="format-csv"
            data-testid="format-csv"
            value="csv"
            label={t("formatPage.formatOptions.csv.label")}
            hint={t("formatPage.formatOptions.csv.hint")}
            onChange={handleFormatChange}
          />
          <Radio
            name="format"
            id="format-html"
            data-testid="format-html"
            value="html"
            label={t("formatPage.formatOptions.html.label")}
            onChange={handleFormatChange}
          />
        </div>
      </div>
      <div className="flex flex-row gap-4">
        <LinkButton.Secondary
          ddata-testid="back-button"
          href={`/${locale}/form-builder/${id}/responses-pilot/location?reset=true`}
        >
          {t("backButton")}
        </LinkButton.Secondary>
        <Button
          dataTestId="continue-button"
          theme="primary"
          disabled={!selectedFormat}
          onClick={handleNext}
        >
          {t("continueButton")}
        </Button>
      </div>
    </div>
  );
};
