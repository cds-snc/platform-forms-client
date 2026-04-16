"use client";
import { useTemplateStore } from "@lib/store/useTemplateStore";

import { useSession } from "next-auth/react";
import { PublishedPreview } from "./PublishedPreview";
import { Language } from "@lib/types/form-builder-types";

export const ClientContainer = ({
  children,
  id,
  locale,
}: {
  children: React.ReactNode;
  id: string;
  locale: Language;
}) => {
  const { isPublished } = useTemplateStore((s) => ({
    isPublished: s.isPublished,
  }));

  const { data: session } = useSession();

  // Conditionally render based on isPublished state
  if (isPublished !== undefined && isPublished && session) {
    return <PublishedPreview locale={locale} id={id} />;
  }

  return children;
};
