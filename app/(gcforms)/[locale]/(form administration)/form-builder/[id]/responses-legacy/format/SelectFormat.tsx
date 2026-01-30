"use client";

import React, { useState } from "react";
import { Button } from "@clientComponents/globals";
import { useResponsesApp } from "../context";
import { useResponsesContext } from "../context/ResponsesContext";
import { Radio } from "../../../components/shared/MultipleChoice";

import { useCallback, useEffect } from "react";
import { LinkButton } from "@root/components/serverComponents/globals/Buttons/LinkButton";
import { FocusHeader } from "@root/app/(gcforms)/[locale]/(support)/components/client/FocusHeader";
import { getStepOf } from "../lib/getStepOf";

import {
  CsvDirectory,
  HtmlDirectory,
  hasFileInputElement,
} from "../components/folder-preview/DirectoryPreview";

export const STORAGE_KEY_PREFIX = "responses-legacy-format-";

export const SelectFormat = ({ locale, id }: { locale: string; id: string }) => {
  const { t, router } = useResponsesApp();
  const { setSelectedFormat, selectedFormat, retrieveResponses, processResponses, apiClient } =
    useResponsesContext();

  const [showAttachments, setShowAttachments] = useState(false);

  // Check if the form has file input elements to determine if attachments folder should be shown in preview
  useEffect(() => {
    async function loadTemplateAndCheckForFileInputs() {
      const template = apiClient && (await apiClient.getFormTemplate());
      const showAttachments = template && hasFileInputElement({ elements: template.elements });

      if (showAttachments) {
        setShowAttachments(true);
      }
    }
    loadTemplateAndCheckForFileInputs();
  }, [apiClient]);

  // Load saved format from localStorage on mount if available
  useEffect(() => {
    const storageKey = `${STORAGE_KEY_PREFIX}${id}`;
    const savedFormat = localStorage.getItem(storageKey);
    if (savedFormat && (savedFormat === "csv" || savedFormat === "html")) {
      setSelectedFormat(savedFormat);
    } else {
      setSelectedFormat("csv"); // default to csv
    }
  }, [id, setSelectedFormat]);

  const handleNext = useCallback(async () => {
    const initialResponses = await retrieveResponses();

    processResponses(initialResponses);

    router.push(`/${locale}/form-builder/${id}/responses-legacy/processing`);
  }, [retrieveResponses, processResponses, router, locale, id]);

  const handleFormatChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const value = evt.target.value;
      setSelectedFormat(value);

      // Save to localStorage for this specific form
      const storageKey = `${STORAGE_KEY_PREFIX}${id}`;
      localStorage.setItem(storageKey, value);
    },
    [setSelectedFormat, id]
  );

  return (
    <div>
      <div className="mb-4" data-testid="step-indicator">
        {t("stepOf", getStepOf("format"))}
      </div>
      <FocusHeader headingTag="h2" dataTestId="format-page-title">
        {t("formatPage.title")}
      </FocusHeader>
      <div className="mb-12">
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
            onChange={handleFormatChange}
            checked={selectedFormat === "csv"}
          />
          <Radio
            name="format"
            id="format-html"
            data-testid="format-html"
            value="html"
            label={t("formatPage.formatOptions.html.label")}
            onChange={handleFormatChange}
            checked={selectedFormat === "html"}
          />
        </div>
      </div>

      <div className="mb-12" data-testid="directory-preview">
        {selectedFormat === "csv" && (
          <div data-testid="csv-directory">
            <CsvDirectory showAttachments={showAttachments} filename={`${id}.csv`} />
          </div>
        )}
        {selectedFormat === "html" && (
          <div data-testid="html-directory">
            <HtmlDirectory showAttachments={showAttachments} />
          </div>
        )}
      </div>

      <div className="flex flex-row gap-4">
        <LinkButton.Secondary
          ddata-testid="back-button"
          href={`/${locale}/form-builder/${id}/responses-legacy/load-key`}
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
