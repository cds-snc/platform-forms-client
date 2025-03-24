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
    const downloadLink = document.createElement("a");
    const blob = new Blob([data], { type: "text/html" });
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = filename;
    downloadLink.click();
    URL.revokeObjectURL(downloadLink.href);
  } else {
    await promptToSave(data, filename, accept);
  }
};

async function promptToSave(data: string, filename: string, accept: object) {
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
}
