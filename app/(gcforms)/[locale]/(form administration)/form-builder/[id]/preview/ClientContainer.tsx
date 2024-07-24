"use client";
import { useEffect, useState } from "react";
import { useTemplateStore } from "@lib/store/useTemplateStore";

import { useSession } from "next-auth/react";
import { PublishedPreview } from "./PublishedPreview";

export const ClientContainer = ({ children }: { children: React.ReactNode }) => {
  const { isPublished } = useTemplateStore((s) => ({
    isPublished: s.isPublished,
  }));
  const [content, setContent] = useState<null | React.ReactNode>(null);

  const { data: session } = useSession();

  // To ensure that content is not flashed on the screen before the redirect, we set the content to null
  // and then set it to the children once the isPublished state is set.
  useEffect(() => {
    if (isPublished !== undefined && isPublished && session) {
      setContent(<PublishedPreview />);
    } else {
      setContent(children);
    }
  }, [children, isPublished, session]);

  return content;
};
