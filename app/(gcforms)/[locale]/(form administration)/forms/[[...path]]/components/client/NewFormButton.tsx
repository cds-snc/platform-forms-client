"use client";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "@i18n/client";
import { LinkButton } from "@clientComponents/globals";
import { clearTemplateStore } from "@clientComponents/form-builder/store/useTemplateStore";

export const NewFormButton = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation("my-forms");

  const createNewFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // TODO: Ask Tim and Dave about this and the related Context etc.
    const handleClick = () => {
      clearTemplateStore();
    };

    const element = createNewFormRef.current;

    if (element !== null) element.addEventListener("click", handleClick);

    return () => {
      if (element !== null) element.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div ref={createNewFormRef} className="inline">
      <LinkButton.Primary href={`/${language}/form-builder`}>
        <>
          <span aria-hidden="true" className="mr-2 inline-block">
            +
          </span>{" "}
          {t("actions.createNewForm")}
        </>
      </LinkButton.Primary>
    </div>
  );
};
