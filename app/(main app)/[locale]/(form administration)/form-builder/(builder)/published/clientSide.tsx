"use client";
import { Published } from "@clientComponents/form-builder/app";
import { useTemplateStore } from "@clientComponents/form-builder/store/useTemplateStore";

export const ClientSide = () => {
  const { id } = useTemplateStore((s) => ({
    id: s.id,
  }));

  return <Published id={id} />;
};
