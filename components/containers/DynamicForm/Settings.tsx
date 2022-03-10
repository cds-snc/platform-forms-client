import React from "react";
import JSONUpload from "../../admin/JsonUpload/JsonUpload";
import { useTranslation } from "next-i18next";
import { DeleteButton } from "../../forms/Button/DeleteButton";
import { useRouter } from "next/router";
import axios from "axios";
import { logMessage } from "@lib/logger";
import { FormDBConfigProperties } from "@lib/types";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import BearerRefresh from "@components/admin/BearerRefresh/BearerRefresh";
import FormAccess from "@components/admin/FormAccess/FormAccess";

interface FormSettingsProps {
  form: FormDBConfigProperties;
}

const handleDelete = async (formID: number) => {
  // redirect to view templates page on success
  const resp = await axios({
    url: "/api/templates",
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      formID: formID,
    },
    timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
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

export const FormSettings = (props: FormSettingsProps): React.ReactElement => {
  const { form } = props;
  const router = useRouter();
  const { t } = useTranslation("admin-templates");
  const newText =
    router.query && router.query.newForm ? (
      <p className="gc-confirmation-banner">{t("settings.new")}</p>
    ) : (
      ""
    );

  return (
    <>
      <h1 className="gc-h1">{t("settings.title")}</h1>
      <div data-testid="formID" className="mb-4">
        Form ID: {form.formID}
      </div>
      <Tabs>
        <TabList>
          <Tab>{t("settings.tabLabels.jsonUpload")}</Tab>
          <Tab>{t("settings.tabLabels.bearerToken")}</Tab>
          <Tab>{t("settings.tabLabels.formAccess")}</Tab>
        </TabList>

        <TabPanel>
          <div>{newText}</div>
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
          <BearerRefresh formID={form.formID}></BearerRefresh>
        </TabPanel>
        <TabPanel>
          <FormAccess formID={form.formID}></FormAccess>
        </TabPanel>
      </Tabs>
    </>
  );
};

export default FormSettings;
