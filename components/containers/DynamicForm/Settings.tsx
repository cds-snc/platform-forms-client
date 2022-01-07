import React, { useEffect, useState } from "react";
import JSONUpload from "../../admin/JsonUpload/JsonUpload";
import { useTranslation } from "next-i18next";
import { DeleteButton } from "../../forms/Button/DeleteButton";
import { useRouter } from "next/router";
import axios from "axios";
import { logMessage } from "@lib/logger";
import { BearerResponse, FormDBConfigProperties } from "@lib/types";
import { Button } from "@components/forms";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

interface FormSettingsProps {
  form: FormDBConfigProperties;
}

const handleDelete = async (formID: number) => {
  // redirect to view templates page on success
  const resp = await axios({
    url: "/api/templates",
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    data: {
      method: "DELETE",
      formID: formID,
    },
    timeout: 0,
  })
    .then((serverResponse) => {
      //success - redirect to view-templates page
      return serverResponse;
    })
    .catch((err) => {
      logMessage.error(err);
      return err;
    });
  return resp.status | resp;
};

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
    logMessage.error(err);
    return err;
  }
};

export const FormSettings = (props: FormSettingsProps): React.ReactElement => {
  const { form } = props;
  const router = useRouter();
  const { t } = useTranslation("admin-templates");
  const [bearerTokenState, setBearerTokenState] = useState("");
  const newText =
    router.query && router.query.newForm ? (
      <p className="gc-confirmation-banner">{t("settings.new")}</p>
    ) : (
      ""
    );

  useEffect(() => {
    setBearerTokenState(form.bearerToken ? form.bearerToken : "");
  }, []);

  return (
    <>
      <Tabs>
        <TabList>
          <Tab>JSON Template</Tab>
          <Tab>Bearer Token</Tab>
        </TabList>

        <TabPanel>
          <h1 className="gc-h1">{t("settings.title")}</h1>
          <div>{newText}</div>
          <div data-testid="formID" className="mb-4">
            Form ID: {form.formID}
          </div>
          <h2>{t("settings.edit")}</h2>
          <JSONUpload form={form}></JSONUpload>
          <br />
          <div>
            <DeleteButton
              action={handleDelete}
              data={form.formID}
              redirect={`/admin/view-templates`}
            ></DeleteButton>
          </div>
        </TabPanel>
        <TabPanel>
          <div>
            {t("settings.bearerToken")}{" "}
            <input type="text" className="gc-input-text" value={bearerTokenState} />
            <br />
            <Button
              type="button"
              onClick={async () => {
                const { bearerToken } = (await handleRefreshBearerToken(
                  form.formID
                )) as unknown as BearerResponse;
                setBearerTokenState(bearerToken);
              }}
            >
              {t("settings.refreshButton")}
            </Button>
          </div>
        </TabPanel>
      </Tabs>
    </>
  );
};

export default FormSettings;
