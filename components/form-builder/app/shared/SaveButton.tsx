import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useSession } from "next-auth/react";

import { Button, StyledLink } from "@components/globals";
import { useTemplateStore } from "../../store";
import { useTemplateStatus, useTemplateContext } from "../../hooks";
import { formatDateTime } from "../../util";
import { useActivePathname } from "@components/form-builder/hooks";
import { cn } from "@lib/utils";

import { Close, CheckIcon } from "@components/form-builder/icons";

const Save = ({
  handleSave,
  templateIsDirty,
}: {
  handleSave: () => void;
  templateIsDirty: boolean;
}) => {
  const { t } = useTranslation(["common", "form-builder"]);

  if (templateIsDirty) {
    return (
      <>
        <Button theme="link" onClick={handleSave} className={cn("mr-1 font-bold")}>
          {t("saveDraft", { ns: "form-builder" })}
        </Button>
      </>
    );
  }

  return (
    <>
      <CheckIcon className="mr-1 mt-1 inline-block fill-green" />
      <span className="mr-2 inline-block">{t("saved", { ns: "form-builder" })}</span>
    </>
  );
};

export const SaveButton = () => {
  const { isPublished, id } = useTemplateStore((s) => ({
    isPublished: s.isPublished,
    id: s.id,
  }));

  const { error, saveForm, templateIsDirty } = useTemplateContext();
  const { activePathname } = useActivePathname();

  const { status } = useSession();
  const { t, i18n } = useTranslation(["common", "form-builder"]);
  const { isReady, asPath } = useRouter();
  const [isStartPage, setIsStartPage] = useState(false);
  const { updatedAt, getTemplateById } = useTemplateStatus();
  const supportHref = `/${i18n.language}/form-builder/support`;

  const handleSave = async () => {
    const saved = await saveForm();

    if (saved) {
      getTemplateById();
    }
  };

  useEffect(() => {
    if (isReady) {
      const activePathname = new URL(asPath, location.href).pathname;
      if (activePathname === "/form-builder") {
        setIsStartPage(true);
      } else {
        setIsStartPage(false);
      }
    }
  }, [asPath, isReady]);
  const dateTime =
    (updatedAt && formatDateTime(new Date(updatedAt).getTime(), `${i18n.language}-CA`)) || [];

  if (isPublished) {
    return null;
  }

  const allowSave =
    activePathname === "/form-builder/edit" || activePathname === "/form-builder/edit/translate";

  if (!allowSave) {
    return null;
  }

  return !isStartPage && status === "authenticated" ? (
    <div
      data-id={id}
      className={cn(
        "mb-2 flex w-[800px] text-sm laptop:text-base",
        id && error && "text-red-destructive"
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      {error ? (
        <span className="inline-block">
          <Close className="inline-block fill-red" />
          <StyledLink
            href={supportHref}
            className="mr-2 text-red no-underline focus:shadow-none active:text-white active:shadow-none"
          >
            {t("errorSavingForm.failedLink", { ns: "form-builder" })}
          </StyledLink>
        </span>
      ) : (
        <Save handleSave={handleSave} templateIsDirty={templateIsDirty.current} />
      )}
      <span>
        {dateTime.length == 2 && (
          <>
            {" - "} {t("lastSaved", { ns: "form-builder" })} {dateTime[1]}
            {", "} {dateTime[0]}
          </>
        )}
      </span>
    </div>
  ) : null;
};
