"use client";
import React, { useMemo } from "react";
import { useTranslation } from "@i18n/client";
import { Alert } from "@clientComponents/globals";
import { NagLevel, NagwareResult } from "@lib/types";

export const Nagware = ({
  nagwareResult,
  nagwarePromptAfter = 21,
  nagwareWarnAfter = 35,
}: {
  nagwareResult: NagwareResult;
  nagwarePromptAfter?: number;
  nagwareWarnAfter?: number;
}) => {
  const { t } = useTranslation("form-builder");

  const notificationContent: {
    type: "warning" | "error";
    title: string;
    body: React.ReactNode;
  } | null = useMemo(() => {
    switch (nagwareResult.level) {
      case NagLevel.UnsavedSubmissionsOver21DaysOld:
        return {
          type: "warning",
          title: t("nagware.unsavedSubmissionsOver21DaysOld.title"),
          body: (
            <>
              {t("nagware.unsavedSubmissionsOver21DaysOld.body1")}{" "}
              <span data-testid="numberOfSubmissions">{nagwareResult.numberOfSubmissions}</span>{" "}
              {t(
                nagwareResult.numberOfSubmissions > 20
                  ? "nagware.unsavedSubmissionsOver21DaysOld.body2.moreThan20Responses"
                  : "nagware.unsavedSubmissionsOver21DaysOld.body2.lessThan20Responses",
                { days: nagwarePromptAfter }
              )}
              <br />
              <br />
              <b>{t("nagware.restrictedDownloadAfter35Days", { days: nagwareWarnAfter })}</b>
            </>
          ),
        };
      case NagLevel.UnconfirmedSubmissionsOver21DaysOld:
        return {
          type: "warning",
          title: t("nagware.unconfirmedSubmissionsOver21DaysOld.title"),
          body: (
            <>
              {t("nagware.unconfirmedSubmissionsOver21DaysOld.body1")}{" "}
              <span data-testid="numberOfSubmissions">{nagwareResult.numberOfSubmissions}</span>{" "}
              {t("nagware.unconfirmedSubmissionsOver21DaysOld.body2", { days: nagwarePromptAfter })}
              <br />
              <br />
              <b>{t("nagware.restrictedDownloadAfter35Days", { days: nagwareWarnAfter })}</b>
            </>
          ),
        };
      case NagLevel.UnsavedSubmissionsOver35DaysOld:
        return {
          type: "error",
          title: t("nagware.unsavedSubmissionsOver35DaysOld.title"),
          body: (
            <>
              {t("nagware.unsavedSubmissionsOver35DaysOld.body1")}{" "}
              <span data-testid="numberOfSubmissions">{nagwareResult.numberOfSubmissions}</span>{" "}
              {t(
                nagwareResult.numberOfSubmissions > 20
                  ? "nagware.unsavedSubmissionsOver35DaysOld.body2.moreThan20Responses"
                  : "nagware.unsavedSubmissionsOver35DaysOld.body2.lessThan20Responses",
                { days: nagwareWarnAfter }
              )}
            </>
          ),
        };
      case NagLevel.UnconfirmedSubmissionsOver35DaysOld:
        return {
          type: "error",
          title: t("nagware.unconfirmedSubmissionsOver35DaysOld.title"),
          body: (
            <>
              {t("nagware.unconfirmedSubmissionsOver35DaysOld.body1")}{" "}
              <span data-testid="numberOfSubmissions">{nagwareResult.numberOfSubmissions}</span>{" "}
              {t("nagware.unconfirmedSubmissionsOver35DaysOld.body2", { days: nagwareWarnAfter })}
            </>
          ),
        };
      case NagLevel.None:
        return null;
    }
  }, [nagwareResult, nagwarePromptAfter, nagwareWarnAfter, t]);

  if (!notificationContent) return <></>;

  if (notificationContent.type === "warning") {
    return (
      <Alert.Warning>
        <Alert.Title>{notificationContent.title}</Alert.Title>
        <p>{notificationContent.body}</p>
      </Alert.Warning>
    );
  }

  return (
    <Alert.Danger>
      <Alert.Title>{notificationContent.title}</Alert.Title>
      <p>{notificationContent.body}</p>
    </Alert.Danger>
  );
};
