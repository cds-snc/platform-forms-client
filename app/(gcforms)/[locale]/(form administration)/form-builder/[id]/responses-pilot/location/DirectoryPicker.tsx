import { showDirectoryPicker } from "native-file-system-adapter";
import { Button } from "@clientComponents/globals";
import { FileSystemDirectoryHandle } from "native-file-system-adapter";

import { useTranslation } from "@i18n/client";

export const DirectoryPicker = ({
  onPick,
}: {
  onPick: (handle: FileSystemDirectoryHandle | null) => void;
}) => {
  const { t } = useTranslation("response-api");
  return (
    <Button
      theme="secondary"
      data-testid="choose-location-button"
      onClick={async () => {
        try {
          const dirHandle = await showDirectoryPicker();
          dirHandle && onPick(dirHandle as FileSystemDirectoryHandle);
        } catch (error) {
          if ((error as Error).name === "AbortError") {
            return;
          }

          // no-op
        }
      }}
    >
      {t("locationPage.chooseLocationButton")}
    </Button>
  );
};
