"use client";
import { useState, useRef } from "react";
import { useTranslation } from "@i18n/client";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { LinkButton } from "@clientComponents/globals";
import { NagwareResult } from "@lib/types";
import { useSetting } from "@lib/hooks/useSetting";
import { Dropdown } from "@clientComponents/admin/Users/Dropdown";
import { themes } from "@clientComponents/globals";
import { ConfirmDelete } from "@clientComponents/form-builder/app/ConfirmDelete";
import { useAccessControl } from "@lib/hooks/useAccessControl";
import { useRefresh } from "@lib/hooks";
import { ExclamationIcon } from "@clientComponents/icons";

type User = {
  id: string;
  name: string | null;
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

export const ManageForms = ({
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
