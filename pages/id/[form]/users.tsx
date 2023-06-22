import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { checkPrivileges } from "@lib/privileges";
import { useTranslation } from "next-i18next";
import React, { ReactElement, useState } from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { getUsers } from "@lib/users";
import { Button } from "@components/globals/Buttons";
import { getTemplateWithAssociatedUsers } from "@lib/templates";
import { FormRecord } from "@lib/types";
import { getProperty } from "@lib/formBuilder";
import axios from "axios";
import { logMessage } from "@lib/logger";
import { useRouter } from "next/router";
import Head from "next/head";
import AdminNavLayout from "@components/globals/layouts/AdminNavLayout";

interface User {
  id: string;
  name: string | null;
  email: string | null;
}

interface AssignUsersToTemplateProps {
  formRecord: FormRecord;
  usersAssignedToFormRecord: User[];
  allUsers: User[];
}

const updateUsersToTemplateAssignations = async (
  formID: string,
  users: { id: string; action: "add" | "remove" }[]
) => {
  try {
    return await axios({
      url: `/api/templates/${formID}`,
      method: "PUT",
      data: {
        users,
      },
      timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
    });
  } catch (e) {
    logMessage.error(e);
  }
};

const usersToOptions = (users: User[]): { value: string; label: string | null }[] => {
  return users.map((user) => {
    return { value: user.id, label: user.email };
  });
};

const Users = ({
  formRecord,
  usersAssignedToFormRecord,
  allUsers,
}: AssignUsersToTemplateProps): React.ReactElement => {
  const { t, i18n } = useTranslation("admin-users");
  const language = i18n.language as string;
  const router = useRouter();
  const assignedToFormRecord = usersToOptions(usersAssignedToFormRecord);
  const [selectedUsers, setSelectedUsers] =
    useState<{ value: string; label: string | null }[]>(assignedToFormRecord);

  const saveAssignations = async () => {
    const usersToAdd: { id: string; action: "add" | "remove" }[] = selectedUsers
      .filter((user) => {
        return !usersAssignedToFormRecord.map((u) => u.id).includes(user.value);
      })
      .map((user) => {
        return { id: user.value, action: "add" };
      });

    const usersToRemove: { id: string; action: "add" | "remove" }[] = usersAssignedToFormRecord
      .filter((user) => {
        return !selectedUsers.map((u) => u.value).includes(user.id);
      })
      .map((user) => {
        return { id: user.id, action: "remove" };
      });

    await updateUsersToTemplateAssignations(formRecord.id, usersToAdd.concat(usersToRemove));
    await router.push({ pathname: `/${i18n}/admin/accounts/${formRecord.id}/manage-forms` });
  };

  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>

      <h1 className="mb-0 border-b-0 text-h1 font-bold md:mb-10 md:text-small_h1">
        Manage ownership - {formRecord.form[getProperty("title", language)] as string}
      </h1>

      <div className="mb-4">{t("assignUsersToTemplate")}</div>
      <p>{t("enterOwnersEmail")} </p>
      <Select
        isClearable
        isSearchable
        isMulti
        components={makeAnimated()}
        options={usersToOptions(allUsers)}
        value={selectedUsers}
        onChange={(value) => setSelectedUsers(value as { value: string; label: string | null }[])}
      />
      <br />
      <Button theme="secondary" type="submit" onClick={() => saveAssignations()}>
        {t("save")}
      </Button>
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

Users.getLayout = (page: ReactElement) => {
  return <AdminNavLayout user={page.props.user}>{page}</AdminNavLayout>;
};

export const getServerSideProps = requireAuthentication(
  async ({ user: { ability }, locale, params }) => {
    checkPrivileges(ability, [
      { action: "update", subject: "FormRecord" },
      { action: "update", subject: "User" },
    ]);

    const formID = params?.form;
    if (!formID || Array.isArray(formID)) return redirect(locale);

    const templateWithAssociatedUsers = await getTemplateWithAssociatedUsers(ability, formID);
    if (!templateWithAssociatedUsers) return redirect(locale);

    const allUsers = (await getUsers(ability)).map((user) => {
      return { id: user.id, name: user.name, email: user.email };
    });

    return {
      props: {
        ...(locale &&
          (await serverSideTranslations(locale, ["common", "admin-users", "admin-login"]))),
        formRecord: templateWithAssociatedUsers.formRecord,
        usersAssignedToFormRecord: templateWithAssociatedUsers.users,
        allUsers,
      },
    };
  }
);

export default Users;
