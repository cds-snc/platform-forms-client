import { useTranslation } from "@i18n/client";
import { BranchingIcon } from "@serverComponents/icons/BranchingIcon";
import { Button } from "@clientComponents/globals";
import { useRouter } from "next/navigation";
import { useTreeRef } from "@formBuilder/components/shared/right-panel/treeview/provider/TreeRefProvider";

export const AddBranchingButton = ({ id, locale }: { id: string; locale: string }) => {
  const { togglePanel } = useTreeRef();
  const router = useRouter();
  const { t } = useTranslation("form-builder");

  return (
    <Button
      onClick={() => {
        // Toggle the panel open as it may be closed.
        togglePanel && togglePanel(true);
        const route = `/${locale}/form-builder/${id}/edit/logic/`;
        router.push(route);
      }}
      theme="secondary"
      className="group/button !border-1.5 border-slate-500 bg-gray-soft !px-4 !py-2 text-sm leading-6 text-indigo-700 hover:bg-gray-200 hover:text-indigo-800"
    >
      <>
        <BranchingIcon className="mr-2 inline-block fill-indigo-500 group-hover/button:fill-indigo-600 group-focus/button:fill-white" />
        {t("groups.addBranch")}
      </>
    </Button>
  );
};
