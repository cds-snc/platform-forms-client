"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@i18n/client";
import { Alert, Button } from "@clientComponents/globals";
import { updateTemplatePublishedStatus } from "@formBuilder/actions";

export const TakeLiveFormOfflineButton = ({
  sourceTemplateId,
  sourceTemplateIsPublished,
  hasUnprocessedSubmissions,
  newResponsesHref,
  downloadedResponsesHref,
  problemResponsesHref,
}: {
  sourceTemplateId: string;
  sourceTemplateIsPublished: boolean;
  hasUnprocessedSubmissions: boolean;
  newResponsesHref: string;
  downloadedResponsesHref: string;
  problemResponsesHref: string;
}) => {
  const router = useRouter();
  const { t } = useTranslation("form-builder");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleTakeOffline = async () => {
    setHasError(false);
    setIsSubmitting(true);

    const { error } = await updateTemplatePublishedStatus({
      id: sourceTemplateId,
      isPublished: false,
      publishReason: "",
      publishFormType: "",
      publishDescription: "",
    });

    if (error) {
      setHasError(true);
      setIsSubmitting(false);
      return;
    }

    router.refresh();
  };

  return (
    <Alert.Warning className="my-5 max-w-4xl">
      <Alert.Title headingTag="h2">
        {sourceTemplateIsPublished ? t("workingCopyOfflineTitle") : t("workingCopyResponsesTitle")}
      </Alert.Title>
      <p className="mb-4">
        {sourceTemplateIsPublished
          ? t("workingCopyOfflineDescription")
          : t("workingCopyResponsesDescription")}
      </p>
      {hasUnprocessedSubmissions && (
        <>
          <p className="mb-2 font-semibold">{t("workingCopyOfflineHasResponses")}</p>
          <p className="mb-4">
            {t("workingCopyViewLiveResponses")}{" "}
            <a href={newResponsesHref} className="underline">
              {t("workingCopyViewLiveNewResponses")}
            </a>{" "}
            {t("workingCopyViewLiveResponsesComma")}{" "}
            <a href={downloadedResponsesHref} className="underline">
              {t("workingCopyViewLiveDownloadedResponses")}
            </a>{" "}
            {t("workingCopyViewLiveResponsesAnd")}{" "}
            <a href={problemResponsesHref} className="underline">
              {t("workingCopyViewLiveProblemResponses")}
            </a>
          </p>
        </>
      )}
      {sourceTemplateIsPublished && (
        <Button onClick={handleTakeOffline} disabled={isSubmitting} theme="secondary">
          {t("workingCopyTakeOffline")}
        </Button>
      )}
      {hasError && (
        <Alert.Danger focussable={true} className="mt-4">
          <p className="mb-0">{t("workingCopyTakeOfflineError")}</p>
        </Alert.Danger>
      )}
    </Alert.Warning>
  );
};
