import { useTranslation } from "@root/i18n/client";

import { Button } from "@root/components/clientComponents/globals";
import { AddIcon } from "@root/components/serverComponents/icons";
import { KeyboardNavTip } from "./KeyboardNavTip";

export const TreeActions = ({ addPage }: { addPage: () => void }) => {
  const { t } = useTranslation("form-builder");
  const newSectionText = t("groups.newPage");

  return (
    <div className="sticky top-0 z-10 flex justify-between border-b-2 border-black bg-gray-50 p-3 align-middle">
      <label className="flex items-center hover:fill-white hover:underline">
        <span className="mr-2 pl-3 text-sm">{newSectionText}</span>
        <Button
          theme="secondary"
          className="p-0 hover:!bg-indigo-500 hover:!fill-white focus:!fill-white"
          onClick={addPage}
        >
          <AddIcon className="hover:fill-white focus:fill-white" title={t("groups.addPage")} />
        </Button>
      </label>
      <KeyboardNavTip />
    </div>
  );
};
