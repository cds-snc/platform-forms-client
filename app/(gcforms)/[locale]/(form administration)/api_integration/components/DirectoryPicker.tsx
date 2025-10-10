import { showDirectoryPicker } from "native-file-system-adapter";
import { Button } from "@clientComponents/globals";

export const DirectoryPicker = ({
  directoryHandle,
  onPick,
}: {
  directoryHandle: unknown;
  onPick: (handle: unknown) => void;
}) => {
  if (directoryHandle) {
    return null;
  }

  return (
    <Button
      onClick={async () => {
        try {
          const dirHandle = await showDirectoryPicker();
          dirHandle && onPick(dirHandle);
        } catch (error) {
          if ((error as Error).name === "AbortError") {
            return;
          }

          // no-op
        }
      }}
    >
      Choose Save Location
    </Button>
  );
};
