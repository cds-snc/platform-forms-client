import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { logMessage } from "@lib/logger";

import { useTemplateStore } from "../store";

interface FormTemplate {
  id: string;
  updatedAt: number;
  isPublished: boolean;
}

export const byId = async (id: string): Promise<FormTemplate | null> => {
  try {
    const result = await axios({
      url: "/api/templates",
      method: "GET",
      headers: { "Content-Type": "application/json" },
      data: { formID: id },
      timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
    });

    if (result.status !== 200) {
      return null;
    }

    return result?.data.find((template: FormTemplate) => template.id === id);
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

  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [updatedAt, setUpdatedAt] = useState<number | undefined>();

  const getTemplateById = useCallback(async () => {
    if ("authenticated" === status) {
      const template = await byId(id);
      setIsPublished(template?.isPublished || false);
      setUpdatedAt(template?.updatedAt);
    }
  }, [id, status]);

  useEffect(() => {
    getTemplateById();
  }, [id, status]);

  return { isPublished, updatedAt, getTemplateById };
};
