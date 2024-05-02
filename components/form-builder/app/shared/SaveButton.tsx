import React from "react";
import { useTranslation } from "next-i18next";
import { useSession } from "next-auth/react";
import { cn } from "@lib/utils";

import { Button, StyledLink } from "@components/globals";
import { useTemplateStore } from "../../store";
import { useTemplateStatus, useTemplateContext } from "../../hooks";
import { formatDateTime } from "../../util";
import { useActivePathname } from "@components/form-builder/hooks";
import { SavedFailIcon, SavedCheckIcon } from "@components/form-builder/icons";

const SaveDraft = ({
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
        <Button theme="link" onClick={handleSave} className={cn("mr-1 font-bold text-slate-500")}>
          {t("saveDraft", { ns: "form-builder" })}
        </Button>
      </>
    );
  }

  return (
    <>
      <span className="inline-block px-1">
        <SavedCheckIcon className="mr-1 inline-block" />
      </span>
      <span className="mr-2 inline-block text-slate-500">{t("saved", { ns: "form-builder" })}</span>
    </>
  );
};

export const DateTime = ({ updatedAt }: { updatedAt: number }) => {
  const { t, i18n } = useTranslation(["common", "form-builder"]);
  const dateTime =
    (updatedAt && formatDateTime(new Date(updatedAt).getTime(), `${i18n.language}-CA`)) || [];

  if (!dateTime || dateTime.length < 2) {
    return null;
  }

  const [date, time] = dateTime;

  return <span>{` - ${t("lastSaved", { ns: "form-builder" })} ${time}, ${date}`}</span>;
};

export const ErrorSavingForm = () => {
  const { t, i18n } = useTranslation(["common", "form-builder"]);
  const supportHref = `/${i18n.language}/form-builder/support`;
  return (
    <span className="inline-block">
      <span className="inline-block px-1">
        <SavedFailIcon className="inline-block fill-red" />
      </span>
      <StyledLink
        href={supportHref}
        className="mr-2 !text-red-700 underline hover:no-underline focus:bg-transparent focus:shadow-none active:bg-transparent"
      >
        {t("errorSavingForm.failedLink", { ns: "form-builder" })}
      </StyledLink>
    </span>
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
  const { updatedAt, getTemplateById } = useTemplateStatus();

  const handleSave = async () => {
    const saved = await saveForm();

    if (saved) {
      getTemplateById();
    }
  };

  if (isPublished) {
    return null;
  }

  const showSave =
    activePathname === "/form-builder/edit" || activePathname === "/form-builder/edit/translate";

  if (!showSave) {
    return null;
  }

  return status === "authenticated" ? (
    <div
      data-id={id}
      className={cn(
        "mb-2 flex w-[800px] text-sm laptop:text-base text-slate-500",
        id && error && "text-red-destructive"
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      {error ? (
        <ErrorSavingForm />
      ) : (
        <SaveDraft handleSave={handleSave} templateIsDirty={templateIsDirty.current} />
      )}
      {updatedAt && <DateTime updatedAt={updatedAt} />}
    </div>
  ) : null;
};
