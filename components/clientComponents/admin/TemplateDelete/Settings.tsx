"use client";
import React from "react";
import JSONUpload from "@clientComponents/admin/JsonUpload/JsonUpload";
import { useTranslation } from "@i18n/client";
import { DeleteButton, Label } from "@clientComponents/forms";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { logMessage } from "@lib/logger";
import { FormRecord } from "@lib/types";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import FormAccess from "@clientComponents/admin/FormAccess/FormAccess";
import { getLocalizedProperty } from "@lib/utils";

interface FormSettingsProps {
  form: FormRecord;
}

const handleDelete = async (formID: string) => {
  // redirect to view templates page on success
  const resp = await axios({
    url: `/api/templates/${formID}`,
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
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

const FormSettings = (props: FormSettingsProps): React.ReactElement => {
  const { form: formRecord } = props;
  const params = useSearchParams();
  const { t, i18n } = useTranslation("admin-templates");
  const language = i18n.language as string;
  const newText = params.get("newForm") ? (
    <p className="gc-confirmation-banner">{t("settings.new")}</p>
  ) : (
    ""
  );

  return (
    <>
      <h1>{t("settings.title")}</h1>
      <div data-testid="formID" className="mb-4">
        <b>Form Title:</b> {formRecord.form[getLocalizedProperty("title", language)] as string}
        <br />
        <b>Form ID:</b> {formRecord.id}
        <br />
        <b>Is form published:</b> {formRecord.isPublished.toString()}
      </div>
      <Tabs>
        <TabList>
          <Tab>{t("settings.tabLabels.jsonUpload")}</Tab>
          <Tab>{t("settings.tabLabels.formAccess")}</Tab>
        </TabList>

        <TabPanel>
          <div>{newText}</div>
          <Label htmlFor="jsonInput">{t("settings.edit")}</Label>
          <JSONUpload form={formRecord} />
          <br />
          <div>
            <DeleteButton
              action={handleDelete}
              data={formRecord.id}
              redirect={`/admin/view-templates`}
            />
          </div>
        </TabPanel>
        <TabPanel>
          <FormAccess formID={formRecord.id} />
        </TabPanel>
      </Tabs>
    </>
  );
};

export default FormSettings;
