"use client";
import { useEffect } from "react";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useRouter } from "next/navigation";
import { useTranslation } from "@i18n/client";

export const ClientContainer = ({ children, id }: { children: React.ReactNode; id: string }) => {
  const router = useRouter();
  const { isPublished } = useTemplateStore((s) => ({
    isPublished: s.isPublished,
  }));
  const {
    i18n: { language },
  } = useTranslation("form-builder");

  useEffect(() => {
    if (isPublished !== undefined && isPublished) {
      router.push(`/${language}/form-builder/${id}/published`);
    }
  }, [id, isPublished, language, router]);

  return children;
};
