import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { crudTemplates } from "@lib/integration/crud";
import React from "react";
import JSONUpload from "@components/admin/JsonUpload/JsonUpload";
import { useTranslation } from "next-i18next";
import { DeleteButton } from "@components/forms/Button/DeleteButton";
import { useRouter } from "next/router";
import axios from "axios";
import { logMessage } from "@lib/logger";
import { FormRecord } from "@lib/types";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import BearerRefresh from "@components/admin/BearerRefresh/BearerRefresh";
import FormAccess from "@components/admin/FormAccess/FormAccess";

interface FormSettingsProps {
  form: FormRecord;
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

const FormSettings = (props: FormSettingsProps): React.ReactElement => {
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
          <JSONUpload form={form} />
          <br />
          <div>
            <DeleteButton
              action={handleDelete}
              data={form.formID}
              redirect={`/admin/view-templates`}
            />
          </div>
        </TabPanel>
        <TabPanel>
          <BearerRefresh formID={form.formID} />
        </TabPanel>
        <TabPanel>
          <FormAccess formID={form.formID} />
        </TabPanel>
      </Tabs>
    </>
  );
};

export const getServerSideProps = requireAuthentication(async (context) => {
  const formID = context?.params?.form ? parseInt(context.params.form as string) : undefined;

  if (formID && !isNaN(formID)) {
    // get form info from db
    const payload = {
      method: "GET",
      formID: formID,
    };
    const lambdaResult = await crudTemplates(payload);

    if (context.locale && lambdaResult.data.records && lambdaResult.data.records.length > 0) {
      return {
        props: {
          form: lambdaResult.data.records[0],
          ...(await serverSideTranslations(context.locale, ["common", "admin-templates"])),
        },
      };
    }
  }
  // if no form returned, 404
  return {
    redirect: {
      // We can redirect to a 'Form does not exist page' in the future
      destination: `/${context.locale}/404`,
      permanent: false,
    },
  };
});

export default FormSettings;
