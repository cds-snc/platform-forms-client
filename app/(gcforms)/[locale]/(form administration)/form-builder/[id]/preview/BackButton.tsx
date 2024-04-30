import { Button } from "@clientComponents/forms";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";

// Must be placed withing context of the GCFormsContext.Provider
export const BackButton = () => {
  const { setGroup, previousGroup } = useGCFormsContext();
  return (
    <Button
      type="button"
      onClick={() => {
        setGroup(previousGroup);
      }}
    >
      BACK TODO
    </Button>
  );
};
