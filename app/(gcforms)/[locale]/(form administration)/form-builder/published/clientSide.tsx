"use client";
import { Published } from "@clientComponents/form-builder/app";
import { useTemplateStore } from "@clientComponents/form-builder/store/useTemplateStore";
import { useRehydrate } from "@clientComponents/form-builder/hooks";

export const ClientSide = () => {
  const { id } = useTemplateStore((s) => ({
    id: s.id,
  }));

  const hasHydrated = useRehydrate();
  if (!hasHydrated) return null;

  return <Published id={id} />;
};
