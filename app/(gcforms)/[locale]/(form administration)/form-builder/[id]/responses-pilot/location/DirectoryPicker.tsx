import { showDirectoryPicker } from "native-file-system-adapter";
import { Button } from "@clientComponents/globals";
import { FileSystemDirectoryHandle } from "native-file-system-adapter";

import { useTranslation } from "@i18n/client";

export const DirectoryPicker = ({
  onPick,
  onClose,
}: {
  onPick: (handle: FileSystemDirectoryHandle | null) => void;
  onClose?: (picked: boolean) => void;
}) => {
  const { t } = useTranslation("response-api");
  return (
    <Button
      theme="secondary"
      onClick={async () => {
        let picked = false;
        try {
          const dirHandle = await showDirectoryPicker();
          if (dirHandle) {
            picked = true;
            onPick(dirHandle as FileSystemDirectoryHandle);
          }
        } catch (error) {
          if ((error as Error).name === "AbortError") {
            // user cancelled the picker
          } else {
            // no-op for other errors
          }
        } finally {
          onClose?.(picked);
        }
      }}
      buttonRef={pickerButtonRef}
    >
      {t("locationPage.chooseLocationButton")}
    </Button>
  );
};
