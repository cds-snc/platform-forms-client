import { ManageFormAccessDialog } from "./ManageFormAccessDialog";
import { ManageFormAccessDialogProvider } from "./ManageFormAccessDialogContext";

export const ManageFormAccessDialogContainer = ({ formId }: { formId: string }) => {
  return (
    <ManageFormAccessDialogProvider formId={formId}>
      <ManageFormAccessDialog />
    </ManageFormAccessDialogProvider>
  );
};
