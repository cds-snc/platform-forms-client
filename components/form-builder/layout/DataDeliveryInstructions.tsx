import React from "react";
import useNavigationStore from "../store/useNavigationStore";
import useTemplateStore from "../store/useTemplateStore";
import { useCallback } from "react";
import { usePublish } from "../hooks/usePublish";
import { Button } from "../layout/Settings";

export const DataDeliveryInstructions = () => {
  const { getSchema } = useTemplateStore();
  const { formId, setFormId } = useNavigationStore();
  const { uploadJson } = usePublish(false);
  const handlePublish = useCallback(async () => {
    const result = await uploadJson(getSchema(), formId);
    if (result && result?.error) {
      return;
    }
    setFormId(result?.id);
  }, [setFormId]);

  return (
    <div>
      <p>To test to see how you will gather form responses, please complete the following steps:</p>
      <ol className="ml-5 mb-5 mt-5">
        {!formId && (
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
