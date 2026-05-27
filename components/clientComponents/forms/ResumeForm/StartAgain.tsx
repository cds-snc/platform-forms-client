import { useRouter } from "next/navigation";
import { useTranslation } from "@i18n/client";

import { InternalLinkIcon } from "@serverComponents/icons";

export const StartAgain = ({ formId }: { formId: string }) => {
  const router = useRouter();
  const {
    t,
    i18n: { language },
  } = useTranslation(["form-builder", "common"]);

  return (
    <button
      className="group bg-gray-background focus:border-gcds-blue-vivid focus:bg-gcds-blue-vivid focus:text-white-default focus:outline-gcds-blue-vivid tablet:px-14 flex items-center rounded-full border-1 border-slate-500 p-2 px-6 hover:cursor-pointer hover:border-indigo-700 hover:bg-violet-50 focus:cursor-pointer focus:outline-[3px] focus:outline-offset-2"
      onClick={async (e) => {
        e.preventDefault();
        router.push(`/${language}/id/${formId}`);
      }}
    >
      <InternalLinkIcon className="mr-4 inline-block scale-125 group-focus:fill-white" />
      <div className="tablet:text-3xl! mb-0! inline-block p-0 text-2xl!">
        {t("saveAndResume.resumePage.restart.title")}
      </div>
    </button>
  );
};
