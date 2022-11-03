import React from "react";
import { useTemplateStore } from "../store/useTemplateStore";
import { useCallback } from "react";
import { usePublish } from "../hooks/usePublish";
import { Button } from "../shared/Button";

export const DataDeliveryInstructions = () => {
  const { getSchema, id, setId } = useTemplateStore((s) => ({
    getSchema: s.getSchema,
    id: s.id,
    setId: s.setId,
  }));

  const { uploadJson } = usePublish();
  const handlePublish = useCallback(async () => {
    const result = await uploadJson(getSchema(), id);
    if (result && result?.error) {
      return;
    }
    setId(result?.id);
  }, [setId]);

  return (
    <div>
      <p>To test to see how you will gather form responses, please complete the following steps:</p>
      <ol className="ml-5 mb-5 mt-5">
        {!id && (
          <li>
            Save your form{" "}
            <Button theme="secondary" onClick={handlePublish}>
              Save
            </Button>
          </li>
        )}
        <li>Fill out the form, and click submit.</li>
      </ol>
    </div>
  );
};
