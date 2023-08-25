import React, { ReactElement, useState, useRef } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { useTranslation } from "next-i18next";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import Head from "next/head";
import { getUnprocessedSubmissionsForUser, getUser } from "@lib/users";
import { checkPrivileges } from "@lib/privileges";
import { getAllTemplatesForUser } from "@lib/templates";
import { LinkButton } from "@components/globals";
import { BackLink } from "@components/admin/LeftNav/BackLink";
import { NagwareResult } from "@lib/types";
import { useSetting } from "@lib/hooks/useSetting";
import { Dropdown } from "@components/admin/Users/Dropdown";
import { themes } from "@components/globals";
import { ConfirmDelete } from "@components/form-builder/app/ConfirmDelete";
import { TemplateStoreProvider } from "@components/form-builder/store";
import { useAccessControl } from "@lib/hooks/useAccessControl";
import { useRefresh } from "@lib/hooks";
import { ExclamationIcon } from "@components/form-builder/icons";
import { TwoColumnLayout } from "@components/globals/layouts";

type User = {
  id: string;
  name: string;
  email: string;
  active: boolean;
};

type Template = {
  id: string;
  titleEn: string;
  titleFr: string;
  isPublished: boolean;
  createdAt: number | Date;
  [key: string]: string | boolean | number | Date;
};

type Templates = Array<Template>;

type Overdue = { [key: string]: NagwareResult };

const OverdueStatus = ({ level }: { level: number }) => {
  const { value: promptAfter } = useSetting("nagwarePhasePrompted");
  const { value: warnAfter } = useSetting("nagwarePhaseWarned");
  const { t } = useTranslation("admin-forms");

  // 35 days +
  if ([3, 4].includes(level)) {
    return (
      <span className="mb-2 block p-2 text-red">
        <ExclamationIcon className="mr-2 inline-block h-6 w-6" />
        {t("overdueResponses", { days: warnAfter })}
      </span>
    );
  }
  // 21 days +
  if ([1, 2].includes(level)) {
    return (
      <span className="mb-2 block p-2 text-red">
        <ExclamationIcon className="mr-2 inline-block h-6 w-6" />
        {t("overdueResponses", { days: promptAfter })}
      </span>
    );
  }

  return null;
};

const ManageForms = ({
  formUser,
  templates,
  overdue,
}: {
  formUser: User;
  templates: Templates;
  overdue: Overdue;
}) => {
  const { t, i18n } = useTranslation("admin-forms");
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const activeForm = useRef<{ id: string; isPublished: boolean } | null>(null);
  const { ability } = useAccessControl();
  const { refreshData } = useRefresh();
  const canManageForms = ability?.can("update", "FormRecord");

  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>
      <div>
        <h1 className="mb-10 border-0">
          {formUser && <span className="block text-base">{formUser?.name}</span>}
          {formUser && <span className="block text-base font-normal">{formUser?.email}</span>}
          {t("title")}
        </h1>
      </div>

      {!templates || templates.length === 0 ? (
        <div className="mb-4">
          <p>{t("noForms")}</p>
        </div>
      ) : null}

      <ul className="m-0 list-none p-0">
        {templates.map(({ id, titleEn, titleFr, isPublished }) => {
          const backgroundColor = isPublished ? "#95CCA2" : "#FEE39F";
          const borderColor = isPublished ? "#95CCA2" : "#FFD875";
          return (
            <li
              className="mb-4 max-w-2xl rounded-md border-2 border-black p-4"
              key={id}
              id={`form-${id}`}
            >
              <div className="flex flex-row items-start justify-between">
                <h2 className="mb-0 mr-2 overflow-hidden pb-0 text-base">
                  {i18n.language === "en" ? (
                    <>
                      {titleEn} / <span lang="fr">{titleFr}</span>
                    </>
                  ) : (
                    <>
                      {titleFr} / <span lang="en">{titleEn}</span>
                    </>
                  )}
                </h2>

                <span
                  className="block rounded px-2 py-1 "
                  style={{
                    backgroundColor: backgroundColor,
                    border: `2px solid ${borderColor}`,
                  }}
                >
                  {isPublished ? t("published") : t("draft")}
                </span>
              </div>

              {overdue[id] && <OverdueStatus level={overdue[id].level} />}

              {/* linking to existing page for now */}
              <div className="mt-10 flex flex-row items-end justify-between">
                <div>
                  <LinkButton.Secondary
                    href={`/${i18n.language}/form-builder/settings/${id}/form?backLink=${formUser.id}`}
                    className="mb-2 mr-3"
                  >
                    {t("manageOwnerships")}
                  </LinkButton.Secondary>
                  <LinkButton.Secondary
                    href={`/${i18n.language}/form-builder/responses/${id}`}
                    className="mb-2 mr-3"
                  >
                    {t("gotoResponses")}
                  </LinkButton.Secondary>
                </div>
                <div>
                  {canManageForms && (
                    <Dropdown>
                      <DropdownMenuPrimitive.Item
                        className={`${themes.destructive} ${themes.base} !block !cursor-pointer`}
                        onClick={() => {
                          activeForm.current = { id, isPublished };
                          setShowConfirm(true);
                        }}
                      >
                        {t("deleteForm")}
                      </DropdownMenuPrimitive.Item>
                    </Dropdown>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <ConfirmDelete
        onDeleted={() => {
          setShowConfirm(false);
          refreshData();
        }}
        show={showConfirm}
        id={activeForm.current?.id || ""}
        isPublished={activeForm.current?.isPublished || false}
        handleClose={setShowConfirm}
      />
    </>
  );
};

const BackToAccounts = ({ id }: { id: string }) => {
  const { t } = useTranslation("admin-users");
  return <BackLink href={`/admin/accounts?id=${id}`}>{t("backToAccounts")}</BackLink>;
};

ManageForms.getLayout = (page: ReactElement) => {
  return (
    <TwoColumnLayout
      user={page.props.user}
      context="admin"
      leftColumnContent={<BackToAccounts id={page.props.formUser.id} />}
    >
      {page}
    </TwoColumnLayout>
  );
};

export const getServerSideProps = requireAuthentication(async ({ params, user: { ability } }) => {
  const id = params?.id || null;
  const { locale = "en" }: { locale?: string } = params ?? {};

  checkPrivileges(ability, [
    { action: "view", subject: "User" },
    {
      action: "view",
      subject: {
        type: "FormRecord",
        // Passing an empty object here just to force CASL evaluate the condition part of a permission.
        // Will only allow users who have privilege of Manage All Forms
        object: {},
      },
    },
  ]);

  const formUser = await getUser(ability, id as string);

  let templates: Templates = [];
  if (id) {
    templates = (await getAllTemplatesForUser(ability, id as string)).map((template) => {
      const {
        id,
        form: { titleEn, titleFr },
        isPublished,
        createdAt,
      } = template;

      return {
        id,
        titleEn,
        titleFr,
        isPublished,
        createdAt: Number(createdAt),
      };
    });
  }

  const overdue = await getUnprocessedSubmissionsForUser(ability, id as string, templates);

  return {
    props: {
      ...(locale &&
        (await serverSideTranslations(locale, [
          "common",
          "admin-forms",
          "admin-login",
          "admin-users",
          "form-builder",
        ]))),
      formUser: formUser,
      templates,
      overdue,
    },
  };
});

export default ManageForms;
