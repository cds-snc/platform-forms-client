"use client";
import { useEffect, useState } from "react";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useRouter } from "next/navigation";
import { useTranslation } from "@i18n/client";

export const ClientContainer = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { isPublished, id } = useTemplateStore((s) => ({
    isPublished: s.isPublished,
    id: s.id,
  }));
  const [content, setContent] = useState<null | React.ReactNode>(null);
  const {
    i18n: { language },
  } = useTranslation("form-builder");
  // To ensure that content is not flashed on the screen before the redirect, we set the content to null
  // and then set it to the children once the isPublished state is set.
  useEffect(() => {
    if (isPublished !== undefined && isPublished) {
      router.push(`/${language}/form-builder/${id}/published`);
    } else {
      setContent(children);
    }
  }, [children, id, isPublished, language, router]);

  return content;
};
