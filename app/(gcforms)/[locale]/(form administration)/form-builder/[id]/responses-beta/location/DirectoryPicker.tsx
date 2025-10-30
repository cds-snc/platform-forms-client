import { showDirectoryPicker } from "native-file-system-adapter";
import { Button } from "@clientComponents/globals";
import { FileSystemDirectoryHandle } from "native-file-system-adapter";

export const DirectoryPicker = ({
  onPick,
}: {
  onPick: (handle: FileSystemDirectoryHandle | null) => void;
}) => {
  return (
    <Button
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
      Choose Save Location
    </Button>
  );
};
