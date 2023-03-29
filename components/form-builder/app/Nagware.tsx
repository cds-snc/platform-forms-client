import React from "react";
import { useTranslation } from "next-i18next";
import { Attention } from "@components/globals/Attention/Attention";
import { NagLevel, NagwareResult } from "@lib/types";

export const Nagware = ({ nagwareResult }: { nagwareResult: NagwareResult }) => {
  const { t } = useTranslation("form-builder");

  if (nagwareResult.level === NagLevel.None) return <></>;

  const generateNotificationContent = (): {
    type: "warning" | "error";
    title: string;
    body: React.ReactNode;
  } => {
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
                  {nagwareResult.numberOfSubmissions}{" "}
                  {t("nagware.unsavedSubmissionsOver21DaysOld.body2.moreThan20Responses")}
                </>
              ) : (
                <>
                  {t("nagware.unsavedSubmissionsOver21DaysOld.body1")}{" "}
                  {nagwareResult.numberOfSubmissions}{" "}
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
              {nagwareResult.numberOfSubmissions}{" "}
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
                  {nagwareResult.numberOfSubmissions}{" "}
                  {t("nagware.unsavedSubmissionsOver35DaysOld.body2.moreThan20Responses")}
                </>
              ) : (
                <>
                  {t("nagware.unsavedSubmissionsOver35DaysOld.body1")}{" "}
                  {nagwareResult.numberOfSubmissions}{" "}
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
              {nagwareResult.numberOfSubmissions}{" "}
              {t("nagware.unconfirmedSubmissionsOver35DaysOld.body2")}
            </>
          ),
        };
      case NagLevel.None:
        throw new Error("Case should not be reached");
    }
  };

  const notificationContent = generateNotificationContent();

  return (
    <>
      <Attention type={notificationContent.type} heading={notificationContent.title}>
        <div className="text-sm">{notificationContent.body}</div>
      </Attention>
    </>
  );
};
