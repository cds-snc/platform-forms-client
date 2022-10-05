import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";

import { useFormik } from "formik";
import { Button } from "@components/forms";
import React, { useState } from "react";
import axios from "axios";
import { useTranslation } from "next-i18next";
import { getAllPrivelages } from "@lib/privelages";
import { Privelage } from "@lib/policyBuilder";
import { useAccessControl } from "@lib/hooks/useAccessControl";
import { logMessage } from "@lib/logger";
import { selected } from "@components/forms/Radio/Radio.stories";

const PrivelageRow = ({
  privelage,
  edit,
}: {
  privelage: Privelage;
  edit: (privelage: Privelage) => void;
}) => {
  const { ability, refreshAbility } = useAccessControl();
  const { i18n } = useTranslation();

  return (
    <tr className="border-b-1">
      <td>{i18n.language === "en" ? privelage.nameEn : privelage.nameFr}</td>
      <td>{i18n.language === "en" ? privelage.descriptionEn : privelage.descriptionFr}</td>
      <td>
        <table className="table-fixed min-w-full text-center">
          <thead>
            <tr>
              <td className="font-bold w-1/3">Action</td>
              <td className="font-bold w-1/3">Subject</td>
              <td className="font-bold w-1/3">Condition</td>
            </tr>
          </thead>
          <tbody>
            {privelage.permissions.map((permission, index) => {
              return (
                <tr key={index}>
                  <td>
                    {Array.isArray(permission.action)
                      ? JSON.stringify(permission.action)
                      : permission.action}
                  </td>
                  <td>
                    {Array.isArray(permission.subject)
                      ? JSON.stringify(permission.subject)
                      : permission.subject}
                  </td>
                  <td>{permission.condition}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </td>
      <td>
        <Button type="button" className="w-32" onClick={() => edit(privelage)}>
          Edit
        </Button>
      </td>
    </tr>
  );
};

const ModifyPrivelage = ({
  privelage,
  cancel,
}: {
  privelage: Privelage | null;
  cancel: () => void;
}) => {
  const formik = useFormik({
    initialValues: {
      nameEn: privelage?.nameEn || "",
      nameFr: privelage?.nameFr || "",
      descriptionEn: privelage?.descriptionEn || "",
      descriptionFr: privelage?.descriptionFr || "",
      permissions: privelage?.permissions || [],
    },
    validate: (values) => {
      const errors = {};
      logMessage.debug(JSON.stringify(values));

      return errors;
    },
    onSubmit: (values, { setSubmitting }) => {
      setTimeout(() => {
        alert(JSON.stringify(values, null, 2));
        setSubmitting(false);
      }, 400);
    },
  });

  return (
    <div>
      <form onSubmit={formik.handleSubmit}>
        <div>
          <label htmlFor="nameEn" className="gc-label">
            English Name
          </label>
          <input
            id="nameEn"
            name="nameEn"
            className="gc-input-text"
            onChange={formik.handleChange}
            value={formik.values.nameEn}
          />
        </div>
        <div>
          <label htmlFor="nameFr" className="gc-label">
            French Name
          </label>
          <input
            id="nameFr"
            name="nameFr"
            className="gc-input-text"
            onChange={formik.handleChange}
            value={formik.values.nameFr}
          />
        </div>
        <div>
          <label htmlFor="descriptionEn" className="gc-label">
            English Description
          </label>
          <input
            id="descriptionEn"
            name="descriptionEn"
            className="gc-input-text"
            onChange={formik.handleChange}
            value={formik.values.descriptionEn}
          />
        </div>
        <div>
          <label htmlFor="descriptionFr" className="gc-label">
            French Description
          </label>
          <input
            id="descriptionFr"
            name="descriptionFr"
            className="gc-input-text"
            onChange={formik.handleChange}
            value={formik.values.descriptionFr}
          />
        </div>

        <Button type="submit">Submit</Button>
        <Button type="button" onClick={cancel}>
          Cancel
        </Button>
      </form>
    </div>
  );
};

const Privelages = ({
  allPrivelages: _privelages,
}: {
  allPrivelages: Privelage[];
}): React.ReactElement => {
  const { t } = useTranslation("admin-privelages");
  const [privelages, setPrivelages] = useState(_privelages);
  const [modifyMode, setModifyMode] = useState(false);
  const [selectedPrivelage, setSelectedPrivealge] = useState<Privelage | null>(null);

  const editPrivelage = (privelage: Privelage) => {
    setSelectedPrivealge(privelage);
    setModifyMode(true);
  };

  const cancelEdit = () => {
    setModifyMode(false);
    setSelectedPrivealge(null);
  };

  return (
    <>
      <h1>{t("title")}</h1>
      <div className="shadow-lg border-4">
        {modifyMode ? (
          <ModifyPrivelage privelage={selectedPrivelage} cancel={cancelEdit} />
        ) : (
          <table className="table-fixed min-w-full">
            <thead>
              <tr className="border-b-2">
                <th className="w-1/6">Privelage Name</th>
                <th className="w-1/3">Description</th>
                <th className="w-3/4">Permissions</th>
              </tr>
            </thead>
            <tbody>
              {privelages.map((privelage) => {
                return (
                  <PrivelageRow key={privelage.id} privelage={privelage} edit={editPrivelage} />
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default Privelages;

export const getServerSideProps = requireAuthentication(async ({ user, locale }) => {
  // Add ability check later for newly defined permissions
  const allPrivelages = await getAllPrivelages();

  return {
    props: {
      ...(locale && (await serverSideTranslations(locale, ["common", "admin-privelages"]))),
      allPrivelages,
    },
  };
});
