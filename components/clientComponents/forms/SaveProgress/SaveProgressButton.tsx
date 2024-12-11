import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { Button } from "@clientComponents/globals/Buttons/Button";

export const SaveProgressButton = () => {
  const { saveProgress } = useGCFormsContext();

  return (
    <Button onClick={saveProgress} theme="link" className="ml-6 block">
      Save Progress
    </Button>
  );
};
