import { Button } from "@root/components/clientComponents/globals";
import { useResponsesContext } from "../context/ResponsesContext";
import { useRouter } from "next/navigation";

export const Confirmation = ({ locale, id }: { locale: string; id: string }) => {
  const router = useRouter();

  const {
    retrieveResponses,
    processResponses,
    processedSubmissionIds,
    setProcessedSubmissionIds,
    setProcessingCompleted,
    setInterrupt,
  } = useResponsesContext();

  const handleCheck = async () => {
    setProcessedSubmissionIds(new Set());
    setProcessingCompleted(false);
    setInterrupt(false);

    setTimeout(async () => {
      const initialResponses = await retrieveResponses();
      processResponses(initialResponses);

      router.push(`/${locale}/form-builder/${id}/responses-beta/processing`);
    }, 500);
  };

  return (
    <div>
      You downloaded {processedSubmissionIds.size} responses.
      <div className="flex flex-row gap-4">
        <Button theme="primary" onClick={handleCheck}>
          Check for new responses
        </Button>
      </div>
    </div>
  );
};
