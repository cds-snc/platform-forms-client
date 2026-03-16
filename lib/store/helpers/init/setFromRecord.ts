import { NotificationsIntervalDefault } from "@gcforms/types";
import { orderGroups } from "@lib/utils/form-builder/orderUsingGroupsLayout";
import { initializeGroups } from "@root/lib/groups/utils/initializeGroups";

import { defaultForm } from "../../defaults";
import { type TemplateStore } from "../../types";

export const setFromRecord: TemplateStore<"setFromRecord"> = (set) => (record) => {
  // Normalize nullable template fields before merging server state into the builder store.
  const formPurpose = typeof record.formPurpose === "string" ? record.formPurpose : "";
  const publishReason = typeof record.publishReason === "string" ? record.publishReason : "";
  const publishFormType = typeof record.publishFormType === "string" ? record.publishFormType : "";
  const publishDesc = typeof record.publishDesc === "string" ? record.publishDesc : "";
  const closingDate = typeof record.closingDate === "string" ? record.closingDate : null;

  set((state) => {
    const allowGroups = state.allowGroupsFlag;
    state.id = record.id;
    // Rebuild form/group structure from the latest saved record so the editor matches the server.
    state.form = initializeGroups({ ...defaultForm, ...record.form }, allowGroups);

    if (!state.form.groupsLayout) {
      state.form.groupsLayout = [];
    } else {
      state.form.groups = orderGroups(state.form.groups, state.form.groupsLayout);
    }

    state.isPublished = record.isPublished;
    state.name = record.name;
    state.securityAttribute = record.securityAttribute;
    state.deliveryOption = record.deliveryOption;
    state.formPurpose = formPurpose;
    state.publishReason = publishReason;
    state.publishFormType = publishFormType;
    state.publishDesc = publishDesc;
    state.closingDate = closingDate;
    state.saveAndResume = record.saveAndResume ?? true;
    state.notificationsInterval = record.notificationsInterval ?? NotificationsIntervalDefault;
    // Downstream editor surfaces use this to remount when server-synced content replaces local state.
    state.changeKey = String(new Date().getTime());
  });
};
