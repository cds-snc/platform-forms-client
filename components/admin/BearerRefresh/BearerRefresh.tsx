import { Button } from "@components/forms";
import Loader from "@components/globals/Loader";
import { logMessage } from "@lib/logger";
import { BearerResponse, FormDBConfigProperties } from "@lib/types";
import axios from "axios";
import { useTranslation } from "next-i18next";
import React, { useEffect, useState } from "react";

export interface BearerRefreshProps {
  form: FormDBConfigProperties;
}

const BearerRefresh = (props: BearerRefreshProps): React.ReactElement => {
  const { form } = props;
  const [bearerTokenState, setBearerTokenState] = useState("");
  const { t } = useTranslation("admin-templates");
  const [errorState, setErrorState] = useState({ message: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setBearerTokenState(form?.bearerToken ? form.bearerToken : "");
  }, []);

  /**
   * Connects to the database and refreshes the bearer token for the specified form ID.
   *
   * @param formID
   */
  const handleRefreshBearerToken = async (formID: number | undefined) => {
    try {
      setSubmitting(true);
      setErrorState({ message: "" });
      const serverResponse = await axios({
        url: `/api/id/${formID}/bearer`,
        method: "POST",
        timeout: 0,
      });
      const { bearerToken } = serverResponse.data as unknown as BearerResponse;
      setBearerTokenState(bearerToken);
    } catch (err) {
      logMessage.error(err as Error);
      setErrorState({ message: t("settings.bearerTokenRefreshError") });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {submitting ? (
        <Loader message="Loading..." />
      ) : (
        <>
          {errorState.message ? (
            <p role="alert" data-testid="alert">
              {errorState.message}
            </p>
          ) : null}
          <h2>{t("settings.bearerToken")}</h2>
          <textarea
            id="bearerToken"
            rows={3}
            name="bearerToken"
            className="gc-textarea full-height font-mono"
            data-testid="bearerToken"
            defaultValue={bearerTokenState}
            readOnly
          ></textarea>
          <Button type="button" onClick={() => handleRefreshBearerToken(form.formID)}>
            {t("settings.refreshButton")}
          </Button>
        </>
      )}
    </>
  );
};

export default BearerRefresh;
