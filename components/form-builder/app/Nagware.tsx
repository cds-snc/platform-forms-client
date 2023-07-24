import React, { useMemo } from "react";
import { useTranslation } from "next-i18next";
import { Attention, AttentionTypes } from "@components/globals/Attention/Attention";
import { NagLevel, NagwareResult } from "@lib/types";

export const Nagware = ({ nagwareResult }: { nagwareResult: NagwareResult }) => {
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
              {nagwareResult.numberOfSubmissions > 20 ? (
                <>
                  {t("nagware.unsavedSubmissionsOver21DaysOld.body1")}{" "}
                  <span data-testid="numberOfSubmissions">{nagwareResult.numberOfSubmissions}</span>{" "}
                  {t("nagware.unsavedSubmissionsOver21DaysOld.body2.moreThan20Responses")}
                </>
              ) : (
                <>
                  {t("nagware.unsavedSubmissionsOver21DaysOld.body1")}{" "}
                  <span data-testid="numberOfSubmissions">{nagwareResult.numberOfSubmissions}</span>{" "}
                  {t("nagware.unsavedSubmissionsOver21DaysOld.body2.lessThan20Responses")}
                </>
              )}

              <br />
              <br />
              <b>{t("nagware.restrictedDownloadAfter35Days")}</b>
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
              {t("nagware.unconfirmedSubmissionsOver21DaysOld.body2")}
              <br />
              <br />
              <b>{t("nagware.restrictedDownloadAfter35Days")}</b>
            </>
          ),
        };
      case NagLevel.UnsavedSubmissionsOver35DaysOld:
        return {
          type: "error",
          title: t("nagware.unsavedSubmissionsOver35DaysOld.title"),
          body: (
            <>
              {nagwareResult.numberOfSubmissions > 20 ? (
                <>
                  {t("nagware.unsavedSubmissionsOver35DaysOld.body1")}{" "}
                  <span data-testid="numberOfSubmissions">{nagwareResult.numberOfSubmissions}</span>{" "}
                  {t("nagware.unsavedSubmissionsOver35DaysOld.body2.moreThan20Responses")}
                </>
              ) : (
                <>
                  {t("nagware.unsavedSubmissionsOver35DaysOld.body1")}{" "}
                  <span data-testid="numberOfSubmissions">{nagwareResult.numberOfSubmissions}</span>{" "}
                  {t("nagware.unsavedSubmissionsOver35DaysOld.body2.lessThan20Responses")}
                </>
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
              {t("nagware.unconfirmedSubmissionsOver35DaysOld.body2")}
            </>
          ),
        };
      case NagLevel.None:
        return null;
    }
  }, [nagwareResult, t]);

  if (!notificationContent) return <></>;

  return (
    <Attention
      type={notificationContent.type === "warning" ? AttentionTypes.WARNING : AttentionTypes.ERROR}
      heading={notificationContent.title}
    >
      <div className="text-sm">{notificationContent.body}</div>
    </Attention>
  );
};
