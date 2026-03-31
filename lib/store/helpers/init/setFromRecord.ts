import { NotificationsIntervalDefault } from "@gcforms/types";
import { orderGroups } from "@lib/utils/form-builder/orderUsingGroupsLayout";
import { initializeGroups } from "@root/lib/groups/utils/initializeGroups";

import { defaultForm } from "../../defaults";
import { type TemplateStore } from "../../types";

export const setFromRecord: TemplateStore<"setFromRecord"> = (set) => (record) => {
  const formPurpose = typeof record.formPurpose === "string" ? record.formPurpose : "";
  const publishReason = typeof record.publishReason === "string" ? record.publishReason : "";
  const publishFormType = typeof record.publishFormType === "string" ? record.publishFormType : "";
  const publishDesc = typeof record.publishDesc === "string" ? record.publishDesc : "";
  const closingDate = typeof record.closingDate === "string" ? record.closingDate : null;

  set((state) => {
    const allowGroups = state.allowGroupsFlag;
    state.id = record.id;
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
    // Keep changeKey updates with the later locked-editing rehydrate flow, not the basic save path.
    state.changeKey = String(new Date().getTime());
  });
};
