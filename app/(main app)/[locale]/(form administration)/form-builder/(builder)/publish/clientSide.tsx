"use client";
import { Publish } from "@clientComponents/form-builder/app";
import { useTemplateStore } from "@clientComponents/form-builder/store";
import { TwoColumnLayout } from "@clientComponents/globals/layouts";

export const ClientSide = () => {
  const { isPublished } = useTemplateStore((s) => ({
    id: s.id,
    isPublished: s.isPublished,
  }));

  if (isPublished) {
    return (
      <TwoColumnLayout>
        <div />
      </TwoColumnLayout>
    );
  }

  return (
    <>
      <Publish />
    </>
  );
};
