declare global {
  interface Window {
    showSaveFilePicker: ({}) => Promise<FileSystemFileHandle>;
    createWritable: () => Promise<FileSystemWritableFileStream>;
  }
}

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
