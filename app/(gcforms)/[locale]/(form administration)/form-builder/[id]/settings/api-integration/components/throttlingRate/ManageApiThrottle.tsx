import { authorization } from "@lib/privileges";
import { ThrottlingRate } from "./ThrottlingRate";

export const ManageApiThrottle = async ({ formId }: { formId: string }) => {
  const manageAllForms = await authorization
    .canManageAllForms()
    .then(() => true)
    .catch(() => false);

  if (!manageAllForms) {
    return null;
  }

  return <ThrottlingRate formId={formId} />;
};
