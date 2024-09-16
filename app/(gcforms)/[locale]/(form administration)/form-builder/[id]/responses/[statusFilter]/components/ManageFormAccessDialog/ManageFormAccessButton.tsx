import { Button } from "@clientComponents/globals";
import { useCustomEvent } from "@lib/hooks/useCustomEvent";

export const ManageFormAccessButton = () => {
  const { Event } = useCustomEvent();

  const openManageFormAccessDialog = () => {
    Event.fire("open-form-access-dialog");
  };

  return (
    <Button
      theme="secondary"
      className="border-1 px-3 py-2 text-sm"
      onClick={openManageFormAccessDialog}
    >
      Manage form access
    </Button>
  );
};
