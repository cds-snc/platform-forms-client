import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { Menu } from "./Menu";
import { MoreIcon } from "@serverComponents/icons";

export const CurrentGroupSelector = () => {
  const { formRecord } = useGCFormsContext();
  const groups = formRecord.form.groups;

  if (!groups || Object.keys(groups).length === 0) {
    return null;
  }

  return (
    <div className="relative ml-2 inline-block">
      <button
        style={{
          anchorName: "--group-menu-trigger",
        }}
        type="button"
        popoverTarget="group-menu"
        className="hover:text-white-default focus:text-white-default flex cursor-pointer rounded border-1 border-slate-500 px-3 py-1 hover:bg-gray-600 focus:bg-gray-600 hover:[&_svg]:fill-white focus:[&_svg]:fill-white"
      >
        <MoreIcon className="size-5" />
      </button>
      <Menu />
    </div>
  );
};
