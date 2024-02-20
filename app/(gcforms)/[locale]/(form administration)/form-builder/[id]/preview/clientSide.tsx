"use client";
import { useTranslation } from "@i18n/client";
import { PreviewNavigation, Preview } from "@clientComponents/form-builder/app";
import { useTemplateStore } from "@clientComponents/form-builder/store";
import { LockIcon } from "@serverComponents/icons";
import Markdown from "markdown-to-jsx";

export const ClientSide = () => {
  const { t } = useTranslation("form-builder");

  const { isPublished } = useTemplateStore((s) => ({
    isPublished: s.isPublished,
  }));

  return (
    <>
      {isPublished ? (
        <>
          <div className="my-5 flex bg-purple-200 p-5">
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
        </>
      ) : (
        <>
          <div className="max-w-4xl">
            <PreviewNavigation />
            <Preview />
          </div>
        </>
      )}
    </>
  );
};
