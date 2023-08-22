import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";
import { NextPageWithLayout } from "../../_app";
import { PageProps } from "@lib/types";
import { getServerSideProps } from "../index";
import { PreviewNavigation, Template, Preview, LeftNavigation } from "@components/form-builder/app";
import { useTemplateStore } from "@components/form-builder/store";
import { LockIcon } from "@formbuilder/icons";
import Markdown from "markdown-to-jsx";
import { TwoColumnLayout } from "@components/globals/layouts";

const Page: NextPageWithLayout<PageProps> = () => {
  const { t } = useTranslation("form-builder");
  const title = `${t("gcFormsTest")} — ${t("gcForms")}`;

  const { isPublished } = useTemplateStore((s) => ({
    isPublished: s.getIsPublished,
  }));

  return (
    <>
      {isPublished() ? (
        <TwoColumnLayout title={title} leftNav={<LeftNavigation />}>
          <div className="mt-5 mb-5 p-5 bg-purple-200 flex">
            <div className="flex">
              <div className="pr-7">
                <LockIcon className="mb-2 scale-125" />
              </div>
              <div>
                <Markdown options={{ forceBlock: true }}>
                  {t("previewDisabledForPublishedForm", { ns: "form-builder" })}
                </Markdown>
              </div>
            </div>
          </div>
        </TwoColumnLayout>
      ) : (
        <TwoColumnLayout title={title} leftNav={<LeftNavigation />}>
          <PreviewNavigation />
          <Preview />
        </TwoColumnLayout>
      )}
    </>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <Template page={page} isFormBuilder />;
};

export { getServerSideProps };
export default Page;
