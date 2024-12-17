import { type TemplateStore } from "../../types";
import { orderGroups } from "@lib/utils/form-builder/orderUsingGroupsLayout";
import { initializeGroups } from "@formBuilder/components/shared/right-panel/treeview/util/initializeGroups";
import { defaultForm } from "../../defaults";

export const importTemplate: TemplateStore<"importTemplate"> = (set) => async (jsonConfig) => {
  set((state) => {
    const allowGroups = state.allowGroupsFlag;
    state.id = "";
    state.lang = "en";
    state.form = initializeGroups({ ...defaultForm, ...jsonConfig }, allowGroups);

    // Ensure order by groups layout
    if (!state.form.groupsLayout) {
      /* No need to order as the groups layout does not exist */
      state.form.groupsLayout = [];
    } else {
      state.form.groups = orderGroups(state.form.groups, state.form.groupsLayout);
    }

    state.isPublished = false;
    state.name = "";
    state.securityAttribute = "Protected A";
    state.deliveryOption = undefined;
    state.formPurpose = "";
    state.publishReason = "";
    state.publishFormType = "";
    state.publishDesc = "";
    state.closingDate = null;
  });
};
