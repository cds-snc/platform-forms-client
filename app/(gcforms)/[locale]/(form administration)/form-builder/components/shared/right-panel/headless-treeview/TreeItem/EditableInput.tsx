import { EditableInputProps } from "../types";

export const EditableInput = ({ item, tree }: EditableInputProps) => {
  return (
    <div key={item.getId()} className="w-5/6">
      <input
        className="m-2 block w-full select-all rounded-md border-2 border-indigo-700 p-2 font-normal outline-none"
        {...item.getRenameInputProps()}
        autoFocus
        onFocus={(e) => {
          e.target.select();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            tree.completeRenaming();
          } else if (e.key === "Escape") {
            e.preventDefault();
            tree.abortRenaming();
          }
        }}
        onBlur={() => {
          tree.completeRenaming();
        }}
      />
    </div>
  );
};
