"use client";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "@i18n/client";
import { useSession } from "next-auth/react";
import { cn, safeJSONParse } from "@lib/utils";
import { toast } from "@formBuilder/components/shared/Toast";
import { Button } from "@clientComponents/globals";
import LinkButton from "@serverComponents/globals/Buttons/LinkButton";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useTemplateContext } from "@lib/hooks/form-builder/useTemplateContext";
import { formatDateTime } from "@lib/utils/form-builder";
import { SavedFailIcon, SavedCheckIcon } from "@serverComponents/icons";
import { usePathname } from "next/navigation";
import { ErrorSaving } from "./ErrorSaving";
import { FormServerErrorCodes } from "@lib/types/form-builder-types";
import { FormProperties } from "@lib/types";

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

const ErrorSavingForm = () => {
  const { t, i18n } = useTranslation(["common", "form-builder"]);
  const supportHref = `/${i18n.language}/support`;
  return (
    <span className="inline-block">
      <span className="inline-block px-1">
        <SavedFailIcon className="inline-block fill-red" />
      </span>
      <LinkButton
        href={supportHref}
        className="mr-2 !text-red-700 underline hover:no-underline focus:bg-transparent focus:!text-red-700 active:bg-transparent active:!text-red-700"
      >
        {t("errorSavingForm.failedLink", { ns: "form-builder" })}
      </LinkButton>
    </span>
  );
};

export const SaveButton = () => {
  const {
    isPublished,
    id,
    getSchema,
    getId,
    getName,
    getDeliveryOption,
    securityAttribute,
    setId,
    notificationsInterval,
  } = useTemplateStore((s) => ({
    isPublished: s.isPublished,
    id: s.id,
    getId: s.getId,
    getSchema: s.getSchema,
    getName: s.getName,
    getDeliveryOption: s.getDeliveryOption,
    securityAttribute: s.securityAttribute,
    setId: s.setId,
    notificationsInterval: s.notificationsInterval,
  }));

  const { templateIsDirty, createOrUpdateTemplate, resetState, updatedAt, setUpdatedAt } =
    useTemplateContext();
  const { status } = useSession();

  const [error, setError] = useState(false);
  const pathname = usePathname();
  const timeRef = useRef(new Date().getTime());

  const handleSave = async () => {
    if (status !== "authenticated") {
      return;
    }

    // If the timeRef is within 2 secs of the current time, don't save
    if (timeRef.current && new Date().getTime() - timeRef.current < 2000) {
      return;
    }
    const formConfig = safeJSONParse<FormProperties>(getSchema());
    if (!formConfig) {
      toast.error(<ErrorSaving errorCode={FormServerErrorCodes.JSON_PARSE} />, "wide");
      return;
    }

    try {
      if (!createOrUpdateTemplate) {
        return;
      }

      const operationResult = await createOrUpdateTemplate({
        id: getId(),
        formConfig,
        name: getName(),
        deliveryOption: getDeliveryOption(),
        securityAttribute: securityAttribute,
        notificationsInterval: notificationsInterval,
      });

      if (operationResult.formRecord === null) {
        throw new Error("Error saving template");
      }

      setId(operationResult.formRecord.id);
      setUpdatedAt(
        new Date(
          operationResult.formRecord.updatedAt ? operationResult.formRecord.updatedAt : ""
        ).getTime()
      );
      setError(false);
      resetState();
    } catch (error) {
      toast.error(<ErrorSaving />, "wide");
      setError(true);
    }
  };

  useEffect(() => {
    return () => {
      handleSave();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isPublished) {
    return null;
  }

  const showSave =
    pathname?.includes("edit") || pathname?.includes("translate") || pathname?.includes("preview");

  if (!showSave) {
    return null;
  }

  return status === "authenticated" ? (
    <div
      data-id={id}
      className={cn(
        "mb-2 flex w-[700px] text-sm laptop:text-base text-slate-500",
        id && error && "text-red-destructive"
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      {error ? (
        <ErrorSavingForm />
      ) : (
        <SaveDraft
          updatedAt={updatedAt}
          handleSave={handleSave}
          templateIsDirty={templateIsDirty.current}
        />
      )}
      {updatedAt && <DateTime updatedAt={updatedAt} />}
    </div>
  ) : null;
};
