import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth/auth";
import { useFormik } from "formik";
import { Button } from "@components/forms";
import React, { ReactElement, useState } from "react";
import axios from "axios";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { checkPrivileges, getAllPrivileges } from "@lib/privileges";
import { Privilege } from "@lib/types";
import { useAccessControl } from "@lib/hooks/useAccessControl";
import { logMessage } from "@lib/logger";
import { useRefresh } from "@lib/hooks";
import AdminNavLayout from "@components/globals/layouts/AdminNavLayout";

const PrivilegeRow = ({
  privilege,
  edit,
}: {
  privilege: Privilege;
  edit: (privilege: Privilege) => void;
}) => {
  const { ability } = useAccessControl();
  const { i18n } = useTranslation();

  return (
    <tr className="border-b-1">
      <td>{i18n.language === "en" ? privilege.nameEn : privilege.nameFr}</td>
      <td>{i18n.language === "en" ? privilege.descriptionEn : privilege.descriptionFr}</td>
      <td>
        <table className="table-fixed min-w-full text-center">
          <thead>
            <tr>
              <td className="font-bold w-1/3">Action</td>
              <td className="font-bold w-1/3">Subject</td>
              <td className="font-bold w-1/3">Conditions</td>
            </tr>
          </thead>
          <tbody>
            {privilege.permissions.map((permission, index) => {
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
                  <td>{JSON.stringify(permission.conditions) ?? "none"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </td>
      <td>
        {ability?.can("update", "Privilege") && (
          <Button type="button" className="w-32" onClick={() => edit(privilege)}>
            Edit
          </Button>
        )}
      </td>
    </tr>
  );
};

const ModifyPrivilege = ({
  privilege,
  backToList,
}: {
  privilege: Privilege | null;
  backToList: () => void;
}) => {
  const formik = useFormik({
    initialValues: {
      nameEn: privilege?.nameEn || "",
      nameFr: privilege?.nameFr || "",
      descriptionEn: privilege?.descriptionEn || "",
      descriptionFr: privilege?.descriptionFr || "",
      permissions: JSON.stringify(privilege?.permissions) || "",
    },
    validate: () => {
      const errors = {};
      // logMessage.debug(JSON.stringify(values));

      return errors;
    },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await axios({
          url: `/api/privileges`,
          method: privilege?.id ? "PUT" : "POST",
          data: {
            privilege: {
              ...(privilege?.id && { id: privilege.id }),
              ...values,
            },
          },
          timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
        });
        setSubmitting(false);
        backToList();
      } catch (e) {
        logMessage.error(e);
      }
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
        <div>
          <label htmlFor="permissions" className="gc-label">
            Permissions
          </label>
          <input
            id="permissions"
            name="permissions"
            className="gc-input-text"
            onChange={formik.handleChange}
            value={formik.values.permissions}
          />
        </div>

        <Button type="submit">Submit</Button>
        <Button type="button" onClick={backToList}>
          Cancel
        </Button>
      </form>
    </div>
  );
};

const Privileges = ({ allPrivileges }: { allPrivileges: Privilege[] }): React.ReactElement => {
  const { t } = useTranslation("admin-privileges");
  const [modifyMode, setModifyMode] = useState(false);
  const [selectedPrivilege, setSelectedPrivilege] = useState<Privilege | null>(null);
  const { refreshData } = useRefresh();
  const { ability } = useAccessControl();

  const editPrivilege = (privilege: Privilege) => {
    setSelectedPrivilege(privilege);
    setModifyMode(true);
  };

  const cancelEdit = () => {
    setModifyMode(false);
    setSelectedPrivilege(null);

    refreshData();
  };

  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>
      <h1>{t("title")}</h1>
      <div className="shadow-lg border-4">
        {modifyMode ? (
          <ModifyPrivilege privilege={selectedPrivilege} backToList={cancelEdit} />
        ) : (
          <div>
            <table className="table-fixed min-w-full">
              <thead>
                <tr className="border-b-2">
                  <th className="w-1/6">Privilege Name</th>
                  <th className="w-1/3">Description</th>
                  <th className="w-3/4">Permissions</th>
                </tr>
              </thead>
              <tbody>
                {allPrivileges.map((privilege) => {
                  return (
                    <PrivilegeRow key={privilege.id} privilege={privilege} edit={editPrivilege} />
                  );
                })}
              </tbody>
            </table>
            {ability?.can("create", "Privilege") && (
              <Button
                type="button"
                onClick={() => {
                  setSelectedPrivilege(null);
                  setModifyMode(true);
                }}
              >
                Create
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

Privileges.getLayout = (page: ReactElement) => {
  return <AdminNavLayout user={page.props.user}>{page}</AdminNavLayout>;
};

export const getServerSideProps = requireAuthentication(async ({ user: { ability }, locale }) => {
  checkPrivileges(ability, [{ action: "view", subject: "Privilege" }]);
  const allPrivileges = await getAllPrivileges(ability);

  return {
    props: {
      ...(locale && (await serverSideTranslations(locale, ["common", "admin-privileges"]))),
      allPrivileges,
    },
  };
});

export default Privileges;
