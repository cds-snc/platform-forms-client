"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "@i18n/client";
import { useSession } from "next-auth/react";
import { cn } from "@lib/utils";
import { toast } from "@formBuilder/components/shared/Toast";
import { Button } from "@clientComponents/globals";
import LinkButton from "@serverComponents/globals/Buttons/LinkButton";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useSubscibeToTemplateStore } from "@lib/store/hooks/useSubscibeToTemplateStore";
import { useTemplateContext } from "@lib/hooks/form-builder/useTemplateContext";
import { formatDateTime } from "@lib/utils/form-builder";
import { SavedFailIcon, SavedCheckIcon } from "@serverComponents/icons";
import { usePathname, useRouter } from "next/navigation";
import { ErrorSaving } from "./ErrorSaving";
import { FormServerErrorCodes } from "@lib/types/form-builder-types";

type SaveState = "idle" | "error" | "locked";

const SaveDraft = ({
  updatedAt,
  handleSave,
  templateIsDirty,
}: {
  updatedAt: number | undefined;
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

  if (!updatedAt) {
    return null;
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

const DateTime = ({ updatedAt }: { updatedAt: number }) => {
  const { t, i18n } = useTranslation(["common", "form-builder"]);
  const dateTime =
    (updatedAt && formatDateTime(new Date(updatedAt).getTime(), `${i18n.language}-CA`)) || [];

  if (!dateTime || dateTime.length < 2) {
    return null;
  }

  const [date, time] = dateTime;

  return <span>{` - ${t("lastSaved", { ns: "form-builder" })} ${time}, ${date}`}</span>;
};

const ErrorSavingForm = ({
  variant,
  lockOwnerName,
}: {
  variant: Exclude<SaveState, "idle">;
  lockOwnerName: string;
}) => {
  const { t, i18n } = useTranslation(["common", "form-builder"]);
  const supportHref = `/${i18n.language}/support`;

  if (variant === "locked") {
    return (
      <span className="inline-block">
        <span className="inline-block px-1">
          <SavedFailIcon className="fill-red inline-block" />
        </span>
        <span className="mr-2 inline-block text-red-700">
          {t("editLock.saveBlocked", { ns: "form-builder", name: lockOwnerName })}
        </span>
      </span>
    );
  }

  return (
    <span className="inline-block">
      <span className="inline-block px-1">
        <SavedFailIcon className="fill-red inline-block" />
      </span>
      <LinkButton
        href={supportHref}
        className="mr-2 text-red-700! underline hover:no-underline focus:bg-transparent focus:text-red-700! active:bg-transparent active:text-red-700!"
      >
        {t("errorSavingForm.failedLink", { ns: "form-builder" })}
      </LinkButton>
    </span>
  );
};

export const SaveButton = () => {
  const { t } = useTranslation("form-builder");
  const router = useRouter();
  const lockChecksEnabled = process.env.NEXT_PUBLIC_APP_ENV !== "test";
  const { isPublished, id, isLockedByOther, editLock } = useTemplateStore((s) => ({
    isPublished: s.isPublished,
    id: s.id,
    isLockedByOther: s.isLockedByOther,
    editLock: s.editLock,
  }));

  const { saveDraft, saveDraftIfNeeded, templateIsDirty, updatedAt } = useTemplateContext();
  const { status } = useSession();
  const lockedByOther = lockChecksEnabled && isLockedByOther;
  const lockOwnerName =
    editLock?.lockedByName || editLock?.lockedByEmail || t("editLock.unknownUser");

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const pathname = usePathname();
  const timeRef = useRef(new Date().getTime());
  const isLockedByOtherRef = useRef(lockedByOther);
  const saveStateRef = useRef(saveState);

  const handleSave = useCallback(async () => {
    if (status !== "authenticated") {
      return;
    }
    if (lockedByOther) {
      return;
    }

    // If the timeRef is within 2 secs of the current time, don't save
    if (timeRef.current && new Date().getTime() - timeRef.current < 2000) {
      return;
    }

    const result = await saveDraft();

    if (result.status === "invalid") {
      toast.error(<ErrorSaving errorCode={FormServerErrorCodes.JSON_PARSE} />, "wide");
      return;
    }

    if (result.status === "locked") {
      toast.error(t("editLock.saveBlocked", { name: lockOwnerName }), "wide");
      setSaveState("locked");
      return;
    }

    if (result.status === "error") {
      toast.error(<ErrorSaving />, "wide");
      setSaveState("error");
      return;
    }

    if (result.status === "saved" && pathname?.includes("/form-builder/0000/")) {
      const formId = result.formId;

      if (formId && formId !== "0000") {
        router.replace(pathname.replace("/form-builder/0000/", `/form-builder/${formId}/`));
      }
    }

    setSaveState("idle");
  }, [lockOwnerName, lockedByOther, pathname, router, saveDraft, status, t]);

  useEffect(() => {
    isLockedByOtherRef.current = lockedByOther;
  }, [handleSave, lockedByOther]);

  useEffect(() => {
    saveStateRef.current = saveState;
  }, [saveState]);

  useSubscibeToTemplateStore(
    (s) => [
      s.form,
      s.name,
      s.deliveryOption,
      s.securityAttribute,
      s.isPublished,
      s.isLockedByOther,
    ],
    () => {
      if (saveStateRef.current !== "idle" && !isLockedByOtherRef.current) {
        setSaveState("idle");
      }
    }
  );

  useEffect(() => {
    return () => {
      if (!isLockedByOtherRef.current) {
        void saveDraftIfNeeded();
      }
    };
  }, [saveDraftIfNeeded]);

  if (isPublished) {
    return null;
  }

  const showSave =
    pathname?.includes("edit") || pathname?.includes("translate") || pathname?.includes("preview");

  if (!showSave) {
    return null;
  }

  if (status !== "authenticated") return null;

  if (lockedByOther) {
    return (
      <div
        data-id={id}
        className="laptop:text-base mb-2 flex w-[700px] text-sm text-slate-500"
        aria-live="polite"
        aria-atomic="true"
      >
        {t("editLock.readOnly", { name: lockOwnerName })}
      </div>
    );
  }

  return (
    <div
      data-id={id}
      className={cn(
        "laptop:text-base mb-2 flex w-[700px] text-sm text-slate-500",
        id && saveState !== "idle" && "text-red-destructive"
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      {saveState !== "idle" ? (
        <ErrorSavingForm variant={saveState} lockOwnerName={lockOwnerName} />
      ) : (
        <SaveDraft
          updatedAt={updatedAt}
          handleSave={handleSave}
          templateIsDirty={templateIsDirty.current}
        />
      )}
      {updatedAt && <DateTime updatedAt={updatedAt} />}
    </div>
  );
};
