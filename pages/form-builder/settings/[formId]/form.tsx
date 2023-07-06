import React, { ReactElement, useId, useState } from "react";
import { useTranslation } from "next-i18next";
import { NextPageWithLayout } from "../../../_app";
import { Template, PageTemplate, Settings } from "@components/form-builder/app";
import { SettingsNavigation } from "@components/form-builder/app/navigation/SettingsNavigation";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getTemplateWithAssociatedUsers } from "@lib/templates";
import { requireAuthentication } from "@lib/auth";
import { checkPrivileges } from "@lib/privileges";
import { getUsers } from "@lib/users";
import { User } from "@prisma/client";
import { FormRecord } from "@lib/types";
import { Alert } from "@components/forms";
import { ErrorStatus } from "@components/forms/Alert/Alert";
import { logMessage } from "@lib/logger";
import { Button } from "@components/globals";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import axios from "axios";

const usersToOptions = (users: User[]): { value: string; label: string | null }[] => {
  return users.map((user) => {
    return { value: user.id, label: user.email };
  });
};

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

interface AssignUsersToTemplateProps {
  formRecord: FormRecord;
  usersAssignedToFormRecord: User[];
  allUsers: User[];
}

const Page: NextPageWithLayout<AssignUsersToTemplateProps> = ({
  formRecord,
  usersAssignedToFormRecord,
  allUsers,
}: AssignUsersToTemplateProps) => {
  const { t } = useTranslation("form-builder");
  const title = `${t("branding.heading")} — ${t("gcForms")}`;

  const [message, setMessage] = useState<ReactElement | null>(null);
  const assignedToFormRecord = usersToOptions(usersAssignedToFormRecord);
  const [selectedUsers, setSelectedUsers] =
    useState<{ value: string; label: string | null }[]>(assignedToFormRecord);

  const saveAssignations = async () => {
    setMessage(null);
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

    const response = await updateUsersToTemplateAssignations(
      formRecord.id,
      usersToAdd.concat(usersToRemove)
    );

    if (response && response.status === 200) {
      setMessage(
        <Alert
          type={ErrorStatus.SUCCESS}
          focussable={true}
          heading={t("responseSuccess.title")}
          tabIndex={0}
          className="mb-2"
        >
          {t("responseSuccess.message")}
        </Alert>
      );
      return response.data;
    }

    setMessage(
      <Alert
        type={ErrorStatus.ERROR}
        focussable={true}
        heading={t("responseFail.title")}
        tabIndex={0}
        className="mb-2"
      >
        {t("responseFail.message")}
      </Alert>
    );
  };

  return (
    <PageTemplate title={title} navigation={<SettingsNavigation />}>
      <div className="mb-6">
        <h2>{t("Manage ownership")}</h2>

        <p>
          Add, remove, or transfer ownership to another GC Forms account within your department or
          agency.
        </p>

        {message && message}

        <p className="mb-4">{t("assignUsersToTemplate")}</p>
        <p className="mb-4 font-bold">{t("enterOwnersEmail")} </p>
        <Select
          instanceId={useId()}
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
      </div>

      <Settings />
    </PageTemplate>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <Template page={page} isFormBuilder />;
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

export const getServerSideProps = requireAuthentication(
  async ({ user: { ability }, locale, params }) => {
    checkPrivileges(ability, [
      { action: "update", subject: "FormRecord" },
      { action: "update", subject: "User" },
    ]);

    const formID = params?.formId;
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

export default Page;
