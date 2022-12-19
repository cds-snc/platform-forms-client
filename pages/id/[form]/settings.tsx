import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { getFullTemplateByID } from "@lib/templates";
import { checkPrivileges } from "@lib/privileges";
import { ReactElement } from "react";
import React from "react";
import JSONUpload from "@components/admin/JsonUpload/JsonUpload";
import { useTranslation } from "next-i18next";
import { DeleteButton, Label } from "@components/forms";
import { useRouter } from "next/router";
import Head from "next/head";
import axios from "axios";
import { logMessage } from "@lib/logger";
import { FormRecord } from "@lib/types";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import BearerRefresh from "@components/admin/BearerRefresh/BearerRefresh";
import FormAccess from "@components/admin/FormAccess/FormAccess";
import { getProperty } from "@lib/formBuilder";
import AdminNavLayout from "@components/globals/layouts/AdminNavLayout";

interface FormSettingsProps {
  form: FormRecord;
}

const handleDelete = async (formID: string) => {
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
  const { form: formRecord } = props;
  const router = useRouter();
  const { t, i18n } = useTranslation("admin-templates");
  const language = i18n.language as string;
  const newText =
    router.query && router.query.newForm ? (
      <p className="gc-confirmation-banner">{t("settings.new")}</p>
    ) : (
      ""
    );

  return (
    <>
      <Head>
        <title>{t("settings.title")}</title>
      </Head>
      <h1>{t("settings.title")}</h1>
      <div data-testid="formID" className="mb-4">
        <b>Form Title:</b> {formRecord.form[getProperty("title", language)] as string}
        <br />
        <b>Form ID:</b> {formRecord.id}
        <br />
        <b>Is form published:</b> {formRecord.isPublished.toString()}
      </div>
      <Tabs>
        <TabList>
          <Tab>{t("settings.tabLabels.jsonUpload")}</Tab>
          <Tab>{t("settings.tabLabels.bearerToken")}</Tab>
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
          <BearerRefresh formID={formRecord.id} />
        </TabPanel>
        <TabPanel>
          <FormAccess formID={formRecord.id} />
        </TabPanel>
      </Tabs>
    </>
  );
};

const redirect = (locale: string | undefined) => {
  return {
    redirect: {
      // We can redirect to a 'Form does not exist page' in the future
      destination: `/${locale}/404`,
      permanent: false,
    },
  };
};

FormSettings.getLayout = (page: ReactElement) => {
  return <AdminNavLayout user={page.props.user}>{page}</AdminNavLayout>;
};

export const getServerSideProps = requireAuthentication(
  async ({ locale, params, user: { ability } }) => {
    // Only users who have the ManageForms privilege can view this page for now
    checkPrivileges(ability, [{ action: "update", subject: { type: "FormRecord", object: {} } }]);

    const formID = params?.form;
    // Needed for typechecking of a ParsedURLQuery type which can be a string or string[]
    if (!formID || Array.isArray(formID)) return redirect(locale);

    if (formID) {
      // get form info from db
      const template = await getFullTemplateByID(ability, formID);

      if (template) {
        return {
          props: {
            form: template,
            ...(locale && (await serverSideTranslations(locale, ["common", "admin-templates"]))),
          },
        };
      }
    }
    // if no form returned, 404
    return redirect(locale);
  }
);

export default FormSettings;
