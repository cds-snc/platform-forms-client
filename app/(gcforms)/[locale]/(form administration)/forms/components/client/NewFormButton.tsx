"use client";

import Link from "next/link";
import { useTranslation } from "@i18n/client";
import { useParams } from "next/navigation";

export const NewFormButton = () => {
  const { t } = useTranslation("my-forms");
  const params = useParams();
  const language = params?.locale as string;

  const containerClassName =
    "group flex h-full w-full items-center justify-center rounded-md border-2 border-dashed border-slate-300 hover:bg-indigo-50 active:bg-indigo-50 focus:bg-indigo-50 bg-white transition-colors no-underline";

  const circleClassName =
    "flex h-10 w-10 items-center justify-center rounded-full border-1 border-indigo-700 bg-indigo-700 text-xl text-white shadow transition-colors group-hover:bg-indigo-500 group-active:bg-indigo-500 group-focus:bg-indigo-500";

  return (
    <Link
      href={`/${language}/form-builder`}
      prefetch={false}
      className={containerClassName}
      aria-labelledby="create-new-form-text"
    >
      <div className="flex flex-col items-center">
        <div className={circleClassName} aria-hidden="true">
          <span aria-hidden="true" className="">
            +
          </span>
        </div>
        <div id="create-new-form-text" className="mt-1 text-sm text-nowrap text-indigo-700">
          {t("actions.createNewForm")}
        </div>
      </div>
    </Link>
  );
};
