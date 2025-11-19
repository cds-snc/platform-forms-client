"use client";

import { Button } from "@clientComponents/globals";
import { useResponsesContext } from "../context/ResponsesContext";
import { Radio } from "../../../components/shared/MultipleChoice";
import { useRouter } from "next/navigation";
import { useTranslation } from "@root/i18n/client";
import { useCallback } from "react";
import { LinkButton } from "@root/components/serverComponents/globals/Buttons/LinkButton";

export const SelectFormat = ({ locale, id }: { locale: string; id: string }) => {
  const { t } = useTranslation("response-api");

  const { setSelectedFormat, selectedFormat, retrieveResponses, processResponses, logger } =
    useResponsesContext();

  const router = useRouter();

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
        <LinkButton.Secondary
          href={`/${locale}/form-builder/${id}/responses-pilot/location?reset=true`}
        >
          {t("backButton")}
        </LinkButton.Secondary>
        <Button theme="primary" disabled={!selectedFormat} onClick={handleNext}>
          {t("continueButton")}
        </Button>
      </div>
    </div>
  );
};
