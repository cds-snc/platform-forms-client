import { useCallback, useState } from "react";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { SubmitButton as DownloadProgress } from "@clientComponents/globals/Buttons/SubmitButton";
import { useTranslation } from "@i18n/client";
import { Language } from "@lib/types/form-builder-types";

declare global {
  interface Window {
    showSaveFilePicker: ({}) => Promise<FileSystemFileHandle>;
    createWritable: () => Promise<FileSystemWritableFileStream>;
  }
}

async function promptToSave(fileName: string, data: string) {
  const handle = await window?.showSaveFilePicker({
    suggestedName: fileName,
    types: [
      {
        accept: { "text/plain": [".txt"] },
      },
    ],
  });

  const writable = await handle.createWritable();
  await writable.write(data);
  await writable.close();
}

export const SaveProgressButton = ({
  formId,
  language,
}: {
  formId: string;
  language: Language;
}) => {
  const { getProgressData } = useGCFormsContext();
  const { t } = useTranslation(["review", "common"]);
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);

      const fileName = `${formId}.txt`;

      const data = btoa(JSON.stringify(getProgressData()));

      if (!window?.showSaveFilePicker) {
        const downloadLink = document.createElement("a");
        const blob = new Blob([data], { type: "text/plain" });
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = fileName;
        downloadLink.click();
        URL.revokeObjectURL(downloadLink.href);
      } else {
        await promptToSave(fileName, data);
      }
      setSaving(false);
    } catch (error) {
      setSaving(false);
    }
  }, [formId, getProgressData]);

  return (
    <div className="flex pt-10">
      <DownloadProgress
        className="mr-4"
        type="button"
        loading={saving}
        theme="secondary"
        onClick={handleSave}
      >
        {t("saveAndResume.saveBtn")}
      </DownloadProgress>
      <LinkButton.Secondary href={`/${language}/id/${formId}/resume`}>
        {t("saveAndResume.resumeBtn")}
      </LinkButton.Secondary>
    </div>
  );
};
