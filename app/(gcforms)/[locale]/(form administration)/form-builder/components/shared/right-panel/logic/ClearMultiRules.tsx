import { Button } from "@clientComponents/globals";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";

export const ClearMultiRules = () => {
  const setGroupNextAction = useGroupStore((state) => state.setGroupNextAction);
  const selectedGroupId = useGroupStore((state) => state.id);
  return (
    <div>
      <p>To add rules at the section level clear your existing option rule(s) first</p>
      <Button
        className="my-4 px-4 py-2"
        onClick={() => {
          setGroupNextAction(selectedGroupId, []);
        }}
      >
        Clear
      </Button>
    </div>
  );
};
