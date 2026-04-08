"use client";

import { useRef, useState } from "react";
import { useTranslation } from "@i18n/client";

import { Button } from "@clientComponents/globals";
import * as Alert from "@clientComponents/globals/Alert/Alert";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { type PropertyChoices } from "@lib/types";
import { MAX_CHOICE_AMOUNT } from "@root/constants";

const parseCsvRows = (text: string) => {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        value += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !inQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }

      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += character;
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  return rows;
};

const escapeCsvValue = (value: string) => {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
};

export const stringifyChoiceOptionsCsv = (choices: PropertyChoices[]): string => {
  return [
    "en,fr",
    ...choices.map(({ en, fr }) => `${escapeCsvValue(en)},${escapeCsvValue(fr)}`),
  ].join("\n");
};

export const parseChoiceOptionsCsv = (
  text: string,
  maxChoices: number = MAX_CHOICE_AMOUNT
): PropertyChoices[] => {
  const rows = parseCsvRows(text)
    .map((row) => row.map((column) => column.replace(/^\uFEFF/, "").trim()))
    .filter((row) => row.some((column) => column.length > 0));

  if (rows.length === 0) {
    throw new Error("empty");
  }

  const hasHeader = rows[0]?.[0]?.toLowerCase() === "en" && rows[0]?.[1]?.toLowerCase() === "fr";
  const dataRows = hasHeader ? rows.slice(1) : rows;

  if (dataRows.length === 0) {
    throw new Error("empty");
  }

  if (dataRows.length > maxChoices) {
    throw new Error("too-many-rows");
  }

  return dataRows.map((row) => {
    const english = row[0] ?? "";
    const french = row[1] ?? "";

    if (!english || !french) {
      throw new Error("invalid-columns");
    }

    return { en: english, fr: french };
  });
};

export const ChoiceOptionsCsvUpload = ({
  id,
  onImport,
}: {
  id: string;
  onImport: (choices: PropertyChoices[]) => void;
}) => {
  const { t } = useTranslation(["form-builder", "common"]);
  const dialogRef = useDialogRef();
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewChoices, setPreviewChoices] = useState<PropertyChoices[]>([]);
  const [error, setError] = useState<string | null>(null);

  const popoverId = `${id}-csv-help`;

  const handleCloseDialog = () => {
    setIsOpen(false);
    setSelectedFile(null);
    setPreviewChoices([]);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }

    requestAnimationFrame(() => {
      triggerButtonRef.current?.focus();
    });
  };

  const parseSelectedFile = async (file: File | null) => {
    setPreviewChoices([]);

    if (!file) {
      return;
    }

    const isCsvFile = file.name.toLowerCase().endsWith(".csv") || file.type.includes("csv");

    if (!isCsvFile) {
      setError(t("choiceOptionsUpload.errors.invalidType"));
      return;
    }

    try {
      const text = await file.text();
      const choices = parseChoiceOptionsCsv(text);
      setPreviewChoices(choices);
    } catch (parseError) {
      setError(
        parseError instanceof Error && parseError.message === "invalid-columns"
          ? t("choiceOptionsUpload.errors.invalidColumns")
          : parseError instanceof Error && parseError.message === "too-many-rows"
            ? t("choiceOptionsUpload.errors.maxChoices", { maxChoices: MAX_CHOICE_AMOUNT })
            : t("choiceOptionsUpload.errors.empty")
      );
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError(t("choiceOptionsUpload.errors.empty"));
      return;
    }

    if (previewChoices.length === 0) {
      await parseSelectedFile(selectedFile);
      return;
    }

    onImport(previewChoices);
    handleCloseDialog();
  };

  return (
    <>
      <Button
        className="!m-0 !mt-4"
        theme="link"
        onClick={() => setIsOpen(true)}
        dataTestId={`${id}-upload-csv-trigger`}
        buttonRef={(element) => {
          triggerButtonRef.current = element;
        }}
      >
        {t("choiceOptionsUpload.uploadButton")}
      </Button>
      <Button
        theme="secondary"
        popoverTarget={popoverId}
        aria-label={t("choiceOptionsUpload.helpButton")}
        className="!m-0 !mt-4 !ml-1 !inline-flex !size-5 !items-center !justify-center !rounded-full !p-0 text-[10px]"
        style={{
          anchorName: `--${popoverId}-trigger`,
        }}
      >
        ?
      </Button>
      <div
        id={popoverId}
        popover="auto"
        className="max-w-md rounded-xl border-1 border-gray-500 bg-white p-4 shadow-lg"
        style={{
          positionAnchor: `--${popoverId}-trigger`,
          positionArea: "bottom span-right",
        }}
      >
        <h3 className="mb-2 text-lg">{t("choiceOptionsUpload.helpTitle")}</h3>
        <p className="mb-3 text-sm">{t("choiceOptionsUpload.helpDescription")}</p>
        <p className="mb-2 text-sm font-semibold">{t("choiceOptionsUpload.exampleLabel")}</p>
        <pre className="overflow-x-auto rounded-md bg-slate-100 p-3 text-sm">{`en,fr\nOption 1,Option 1 FR\nOption 2,Option 2 FR`}</pre>
      </div>
      {isOpen && (
        <Dialog
          dialogRef={dialogRef}
          handleClose={handleCloseDialog}
          title={t("choiceOptionsUpload.dialogTitle")}
          actions={
            <div className="flex gap-3">
              <Button onClick={handleImport}>{t("choiceOptionsUpload.importButton")}</Button>
              <Button
                theme="secondary"
                onClick={handleCloseDialog}
                dataTestId={`${id}-cancel-upload-csv`}
              >
                {t("cancel")}
              </Button>
            </div>
          }
        >
          <div className="p-4">
            <p className="mb-4">{t("choiceOptionsUpload.dialogDescription")}</p>
            {error && (
              <Alert.Danger focussable={true} className="mb-4">
                <Alert.Title headingTag="h3">{t("error", { ns: "common" })}</Alert.Title>
                <Alert.Body>{error}</Alert.Body>
              </Alert.Danger>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0] ?? null;
                setSelectedFile(file);
                setError(null);
                await parseSelectedFile(file);
              }}
            />
            <Button
              theme="secondary"
              onClick={() => {
                setError(null);
                if (inputRef.current) {
                  inputRef.current.value = "";
                  inputRef.current.click();
                }
              }}
            >
              {t("choiceOptionsUpload.selectFile")}
            </Button>
            <p className="mt-3 text-sm text-slate-700">
              {selectedFile?.name ?? t("choiceOptionsUpload.noFileSelected")}
            </p>
            {previewChoices.length > 0 && (
              <>
                <p className="mt-3 text-sm text-slate-700">
                  {t("choiceOptionsUpload.previewCount", { count: previewChoices.length })}
                </p>
                <details className="mt-3 text-sm text-slate-700">
                  <summary>{t("choiceOptionsUpload.previewSummary")}</summary>
                  <ul className="mt-2 list-disc pl-5">
                    {previewChoices.slice(0, 5).map((choice, index) => (
                      <li key={`${choice.en}-${choice.fr}-${index}`}>
                        {choice.en} / {choice.fr}
                      </li>
                    ))}
                  </ul>
                </details>
              </>
            )}
          </div>
        </Dialog>
      )}
    </>
  );
};
