import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

import { useTemplateStore } from "../store";
import { useTemplateContext } from "../hooks";

export const useAutoSave = () => {
  const { status } = useSession();
  const { saveForm } = useTemplateContext();
  const saved = useRef(false);

  const { setId, getIsPublished } = useTemplateStore((s) => ({
    setId: s.setId,
    getIsPublished: s.getIsPublished,
  }));

  useEffect(() => {
    if (status === "authenticated" && !saved.current && !getIsPublished()) {
      const save = async () => {
        const result = await saveForm();
        if (result) {
          setId(result);
        }
      };

      save();

      return () => {
        saved.current = true;
      };
    }
  }, [status, saveForm, setId, getIsPublished]);
};
