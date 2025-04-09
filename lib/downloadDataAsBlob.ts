declare global {
  interface Window {
    showSaveFilePicker: ({}) => Promise<FileSystemFileHandle>;
    createWritable: () => Promise<FileSystemWritableFileStream>;
  }
}

/**
 * Download data as blob
 * @param data string
 * @param filename string ex: "file.html"
 * @param accept object ex: { "text/html": [".html"] }
 */
export const downloadDataAsBlob = async (data: string, filename: string, accept: object) => {
  if (!window?.showSaveFilePicker) {
    downloadAsLink(data, filename);
    return;
  }

  try {
    await promptToSave(data, filename, accept);
  } catch (error) {
    downloadAsLink(data, filename);
  }
};

async function downloadAsLink(data: string, filename: string) {
  try {
    const downloadLink = document.createElement("a");
    const blob = new Blob([data], { type: "text/html" });
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = filename;
    downloadLink.click();
    URL.revokeObjectURL(downloadLink.href);
  } catch (error) {
    throw new Error("FD01 " + (error as Error).message);
  }
}

async function promptToSave(data: string, filename: string, accept: object) {
  try {
    const handle = await window?.showSaveFilePicker({
      excludeAcceptAllOption: true,
      suggestedName: filename,
      types: [
        {
          accept,
        },
      ],
    });

    const writable = await handle.createWritable();
    await writable.write(data);
    await writable.close();
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      // User cancelled the file picker
      return;
    }
    throw error;
  }
}
