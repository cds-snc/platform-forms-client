import React from "react";
import JSONUpload from "../../admin/JsonUpload/JsonUpload";
import { useTranslation } from "next-i18next";
import { DeleteButton } from "../../forms/Button/DeleteButton";
import { useRouter } from "next/router";
import axios from "axios";
import { logMessage } from "../../../lib/logger";
import { FormDBConfigProperties } from "../../../lib/types";
import { Button } from "@components/forms";

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

const handleRefreshBearerToken = async (formID: number) => {
  // redirect to view templates page on success
  try {
    const serverResponse = await axios({
      url: `/api/id/${formID}/bearer`,
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: {
        formID: formID,
      },
      timeout: 0,
    });
    return serverResponse;
  } catch (err) {
    logMessage.error(err);
    return err;
  }
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
      <div>{newText}</div>
      <div data-testid="formID" className="mb-4">
        Form ID: {form.formID}
      </div>
      <div>
        {t("settings.bearerToken")} {form.bearerToken}
        <Button
          type="button"
          onClick={async () => {
            handleRefreshBearerToken(form.formID);
          }}
        >
          Refresh
        </Button>
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
    </>
  );
};

export default FormSettings;
