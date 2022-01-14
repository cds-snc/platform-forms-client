import { Button } from "@components/forms";
import { logMessage } from "@lib/logger";
import { BearerResponse, FormDBConfigProperties } from "@lib/types";
import axios from "axios";
import { useTranslation } from "next-i18next";
import React, { useEffect, useState } from "react";

interface BearerRefreshProps {
  form?: FormDBConfigProperties;
}

/**
 * Connects to the database and refreshes the bearer token for the specified form ID.
 *
 * @param formID
 * @returns the response data from the server
 */
const handleRefreshBearerToken = async (formID: number) => {
  try {
    const serverResponse = await axios({
      url: `/api/id/${formID}/bearer`,
      method: "POST",
      timeout: 0,
    });
    return serverResponse.data;
  } catch (err) {
    logMessage.error(err as Error);
    return err;
  }
};

const BearerRefresh = (props: BearerRefreshProps): React.ReactElement => {
  const { form } = props;
  const [bearerTokenState, setBearerTokenState] = useState("");
  const { t } = useTranslation("admin-templates");

  useEffect(() => {
    setBearerTokenState(form?.bearerToken ? form.bearerToken : "");
  }, []);

  return (
    <>
      {t("settings.bearerToken")}{" "}
      <input readOnly type="text" className="gc-input-text" value={bearerTokenState} />
      <br />
      <Button
        type="button"
        onClick={async () => {
          const { bearerToken } = (await handleRefreshBearerToken(
            form?.formID ? form.formID : 0
          )) as unknown as BearerResponse;
          setBearerTokenState(bearerToken);
        }}
      >
        {t("settings.refreshButton")}
      </Button>
    </>
  );
};

export default BearerRefresh;
