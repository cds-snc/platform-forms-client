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
          // @ts-expect-error - CSS anchor positioning is not in the types yet
          anchorName: "--group-menu-trigger",
        }}
        type="button"
        popoverTarget="group-menu"
        className="flex cursor-pointer rounded border-1 border-slate-500 px-3 py-1 hover:bg-gray-600 hover:text-white-default focus:bg-gray-600 focus:text-white-default [&_svg]:hover:fill-white [&_svg]:focus:fill-white"
      >
        <MoreIcon className="size-5" />
      </button>
      <Menu />
    </div>
  );
};
