import { useFormStatus } from "react-dom";
import { Button } from "@clientComponents/globals";

export const SubmitButton = ({ text }: { text: string }) => {
  const { pending } = useFormStatus();
  return (
    <Button theme="primary" className="mr-4" type="submit" disabled={pending}>
      {text}
    </Button>
  );
};
