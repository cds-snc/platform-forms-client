import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { logMessage } from "@lib/logger";

import { useTemplateStore } from "../store";

interface FormTemplate {
  id: string;
  updatedAt: number;
}

export const byId = async (id: string): Promise<FormTemplate | null> => {
  if (!id) {
    return null;
  }

  try {
    const result = await axios({
      url: `/api/templates/${id}`,
      method: "GET",
      headers: { "Content-Type": "application/json" },
      timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
    });

    if (result.status !== 200) {
      return null;
    }
    return result.data;
  } catch (err) {
    logMessage.error(err);
    return null;
  }
};

export const useTemplateStatus = () => {
  const { status } = useSession();
  const { id } = useTemplateStore((s) => ({
    id: s.id,
  }));

  const [updatedAt, setUpdatedAt] = useState<number | undefined>();

  const getTemplateById = useCallback(async () => {
    if ("authenticated" === status) {
      const template = await byId(id);
      setUpdatedAt(template?.updatedAt);
    }
  }, [id, status]);

  useEffect(() => {
    getTemplateById();
  }, [id, status, getTemplateById]);

  return { updatedAt, getTemplateById };
};
