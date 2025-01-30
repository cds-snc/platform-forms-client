import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { Button } from "@clientComponents/globals/Buttons/Button";

declare global {
  interface Window {
    showSaveFilePicker: ({}) => Promise<FileSystemFileHandle>;
    createWritable: () => Promise<FileSystemWritableFileStream>;
  }
}

export const SaveProgressButton = ({ formId }: { formId: string }) => {
  const { getProgressData } = useGCFormsContext();

  const handleSave = async () => {
    try {
      const formData = getProgressData();
      const encodedformDataEn = btoa(JSON.stringify(formData));

      const handle = await window?.showSaveFilePicker({
        suggestedName: `form-progress-${formId}.txt`,
        types: [
          {
            description: "Text Files",
            accept: { "text/plain": [".txt"] },
          },
        ],
      });

      try {
        const writable = await handle.createWritable();
        await writable.write(encodedformDataEn);
        await writable.close();
      } catch (error) {
        if (error instanceof Error) {
          // console.error("Error writing file:", error.message);
        }
        // Ensure stream is closed on error
        // await writable?.abort();
      }
    } catch (error) {
      // Handle user abort or permissions error
      /*
      if (error.name !== "AbortError") {
        console.error("Save failed:", error);
      }
      */
    }
  };

  return (
    <div className="flex pt-10">
      <Button theme="secondary" onClick={handleSave}>
        Save Progress
      </Button>
    </div>
  );
};
