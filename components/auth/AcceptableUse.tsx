import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "next-i18next";
import { RichText } from "../../components/forms/RichText/RichText";
import { logMessage } from "@lib/logger";
import axios from "axios";
import { signOut } from "next-auth/react";

interface AcceptableUseProps {
  content: string;
  lastLoginTime?: string;
  userId: string;
}
const AcceptableUseTerms = (props: AcceptableUseProps): React.ReactElement => {
  const { t, i18n } = useTranslation("common");
  const { content, lastLoginTime, userId } = props;
  const agreeAcceptableUse = async () => {
    try {
      await axios({
        url: "/api/acceptableuse",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          userID: userId,
        },
        timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
      });
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
          {t("acceptableUsePage.lastLoginTime")} : {lastLoginTime}
        </span>
      </div>
      <RichText className="gc-acceptable-use-content">{content}</RichText>
      <div className="gc-acceptable-use-control-btn">
        <button type="button" className="gc-agree-btn" onClick={agreeAcceptableUse}>
          {" "}
          {t("acceptableUsePage.agree")}
        </button>
        <button type="button" className="gc-cancel-btn" onClick={cancel}>
          {" "}
          {t("acceptableUsePage.cancel")}
        </button>
      </div>
    </>
  );
};

AcceptableUseTerms.propTypes = {
  content: PropTypes.string.isRequired,
  lastLoginTime: PropTypes.string,
  userId: PropTypes.string.isRequired,
};

export default AcceptableUseTerms;
