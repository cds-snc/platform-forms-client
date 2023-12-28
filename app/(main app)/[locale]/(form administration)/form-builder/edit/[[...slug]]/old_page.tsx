"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { EditNavigation } from "@clientComponents/form-builder/app";
import { Edit } from "@clientComponents/form-builder/app/edit";
import { useTemplateStore } from "@clientComponents/form-builder/store";

export const OldPage = () => {
  const router = useRouter();

  const { id, isPublished } = useTemplateStore((s) => ({
    id: s.id,
    isPublished: s.isPublished,
  }));

  useEffect(() => {
    if (isPublished) {
      router.replace(`/form-builder/settings/${id}`);
      return;
    }
  }, [router, isPublished, id]);

  if (isPublished) {
    return <div />;
  }

  return (
    <>
      <EditNavigation />
      <Edit />
    </>
  );
};
