"use client";
import { useEffect } from "react";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useRouter } from "next/navigation";
import { useTranslation } from "@i18n/client";

export const ClientContainer = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { isPublished, id } = useTemplateStore((s) => ({
    isPublished: s.isPublished,
    id: s.id,
  }));

  const {
    i18n: { language },
  } = useTranslation("form-builder");

  useEffect(() => {
    if (isPublished !== undefined && !isPublished) {
      router.replace(`/${language}/form-builder/${id}/publish`);
    }
  }, [id, isPublished, language, router]);

  // If not published, show nothing while redirecting
  if (isPublished !== undefined && !isPublished) {
    return null;
  }

  return children;
};
