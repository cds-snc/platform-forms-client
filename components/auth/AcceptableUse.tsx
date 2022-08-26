import React from "react";
import { useTranslation } from "next-i18next";
import { RichText } from "../../components/forms/RichText/RichText";
import { logMessage } from "@lib/logger";
import axios from "axios";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { getCsrfToken } from "next-auth/react";

export interface AcceptableUseProps {
  content: string;
  lastLoginTime?: Date | string;
  userId: string | undefined;
  formID: string | undefined;
}
export const AcceptableUseTerms = (props: AcceptableUseProps): React.ReactElement => {
  const router = useRouter();
  const { t, i18n } = useTranslation("common");
  const { content, lastLoginTime, userId, formID } = props;
  const time = lastLoginTime
    ? new Date(lastLoginTime).toLocaleString(`${i18n.language + "-CA"}`)
    : undefined;

  const agree = async () => {
    const token = await getCsrfToken();
    try {
      if (token) {
        return await axios({
          url: "/api/acceptableuse",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": token,
          },
          data: {
            userID: userId,
          },
          timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
        })
          .then(() => {
            router.push({ pathname: `/${i18n.language}/id/${formID}/retrieval` });
          })
          .catch((err) => {
            logMessage.error(err);
          });
      } else {
        logMessage.error("Undefined CSRF Token");
      }
    } catch (err) {
      logMessage.error(err as Error);
    }
  };

  const cancel = async () => {
    signOut({ callbackUrl: `/${i18n.language}/auth/logout` });
  };

  return (
    <>
      <div className="gc-acceptable-use-header">
        <h1>{t("acceptableUsePage.welcome")}</h1>
        <span>
          <>
            {t("acceptableUsePage.lastLoginTime")} : {time}
          </>
        </span>
      </div>
      <RichText className="gc-acceptable-use-content">{content}</RichText>
      <div className="gc-acceptable-use-control-btn">
        <button type="button" className="gc-agree-btn" onClick={agree}>
          {t("acceptableUsePage.agree")}
        </button>
        <button type="button" className="gc-cancel-btn" onClick={cancel}>
          {t("acceptableUsePage.cancel")}
        </button>
      </div>
    </>
  );
};

export default AcceptableUseTerms;
