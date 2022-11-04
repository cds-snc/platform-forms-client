import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getAllTemplates } from "@lib/templates";
import { requireAuthentication } from "@lib/auth";
import { checkPrivileges } from "@lib/privileges";

import React, { useEffect } from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { CardGrid } from "@components/myforms/CardGrid/CardGrid";
import { CardProps } from "@components/myforms/Card/Card";

interface FormsDataItem {
  id: string;
  titleEn: string;
  titleFr: string;
  url: string;
  date: string;
  isPublished: boolean;
}
interface MyFormsProps {
  templates: Array<FormsDataItem>;
}

// TODO: Tabs - add keynav left and right keys and focus to first card on activate
export default function RenderMyForms({ templates }: MyFormsProps) {
  const router = useRouter();
  const path = String(router.query?.path);
  const { t, i18n } = useTranslation(["my-forms"]);

  const templatesAll = templates.sort((itemA, itemB) => {
    return new Date(itemB.date).getTime() - new Date(itemA.date).getTime();
  }) as Array<CardProps>;

  const templatesPublished = templatesAll?.filter(
    (item) => item?.isPublished === true
  ) as Array<CardProps>;

  const templatesDrafts = templatesAll?.filter(
    (item) => item?.isPublished === false
  ) as Array<CardProps>;

  useEffect(() => {
    // Default route is "published". Done here vs getServerSideProps to avoid extra data fetch
    const formStateRegex = /^(drafts|published|all)$/gi;
    if (!formStateRegex.test(String(path))) {
      router.push(`/${i18n.language}/myforms/published`, undefined, { shallow: true });
    }
  }, []);

  return (
    <div>
      <h2 id="title-myforms">{t("title")}</h2>
      <nav className="mb-14">
        <ul className="gc-horizontal-list" role="tablist" aria-labelledby="title-myforms">
          <li
            className={`gc-horizontal-item${
              path === "drafts" ? " [&>A]:no-underline [&>A]:hover:underline" : ""
            }`}
          >
            <a
              id="tab-drafts"
              href="/myforms/drafts"
              role="tab"
              aria-selected={path === "drafts" ? "true" : "false"}
              aria-controls="tabpanel-drafts"
              onClick={(e) => {
                e.preventDefault();
                router.push(`/${i18n.language}/myforms/drafts`, undefined, { shallow: true });
              }}
            >
              {t("nav.drafts")}
            </a>
          </li>
          <li
            className={`gc-horizontal-item${
              path === "published" ? " [&>A]:no-underline hover:underline" : ""
            }`}
          >
            <a
              id="tab-published"
              href="/myforms/published"
              role="tab"
              aria-selected={path === "published" ? "true" : "false"}
              aria-controls="tabpanel-published"
              onClick={(e) => {
                e.preventDefault();
                router.push(`/${i18n.language}/myforms/published`, undefined, { shallow: true });
              }}
            >
              {t("nav.published")}
            </a>
          </li>
          <li
            className={`gc-horizontal-item${
              path === "all" ? " [&>A]:no-underline hover:underline" : ""
            }`}
          >
            <a
              id="tab-all"
              href="/myforms/all"
              role="tab"
              aria-selected={path === "all" ? "true" : "false"}
              aria-controls="tabpanel-all"
              onClick={(e) => {
                e.preventDefault();
                router.push(`/${i18n.language}/myforms/all`, undefined, { shallow: true });
              }}
            >
              {t("nav.all")}
            </a>
          </li>
        </ul>
      </nav>
      <div className="mb-6">
        <a href="/admin/form-builder">
          {t("actions.createNewForm")} <span aria-hidden="true">+</span>
        </a>
      </div>
      <section
        id="tabpanel-drafts"
        role="tabpanel"
        aria-labelledby="tab-drafts"
        className={path === "drafts" ? "" : "hidden"}
      >
        <CardGrid cards={templatesDrafts}></CardGrid>
      </section>
      <section
        id="tabpanel-published"
        role="tabpanel"
        aria-labelledby="tab-published"
        className={path === "published" ? "" : "hidden"}
      >
        <CardGrid cards={templatesPublished}></CardGrid>
      </section>
      <section
        id="tabpanel-all"
        role="tabpanel"
        aria-labelledby="tab-all"
        className={path === "all" ? "" : "hidden"}
      >
        <CardGrid cards={templatesAll}></CardGrid>
      </section>
    </div>
  );
}

export const getServerSideProps = requireAuthentication(
  async ({ user: { ability, id }, locale }) => {
    {
      checkPrivileges(
        ability,
        [
          { action: "view", subject: "FormRecord" },
          { action: "update", subject: "FormRecord" },
        ],
        "one"
      );

      const templates = (await getAllTemplates(ability, id)).map((template) => {
        const {
          id,
          form: { titleEn, titleFr },
          isPublished,
          updated_at,
        } = template;
        return {
          id,
          titleEn,
          titleFr,
          isPublished,
          date: updated_at,
          url: `/${locale}/id/${id}`,
        };
      });

      return {
        props: {
          templates,
          ...(locale && (await serverSideTranslations(locale, ["common", "my-forms"]))),
        },
      };
    }
  }
);
