import { type TemplateStore } from "../../types";
import { initializeGroups } from "@formBuilder/components/shared/right-panel/treeview/util/initializeGroups";
import { defaultForm } from "../../defaults";
import { Language } from "../../../types/form-builder-types";
import { orderGroups } from "@lib/utils/form-builder/orderUsingGroupsLayout";

export const initialize: TemplateStore<"initialize"> =
  (set) =>
  (language = "en") => {
    set((state) => {
      const allowGroups = state.allowGroupsFlag;
      state.id = "";
      state.lang = language as Language;
      state.translationLanguagePriority = language as Language;
      state.form = initializeGroups({ ...defaultForm }, allowGroups);

      // Ensure order by groups layout
      if (!state.form.groupsLayout) {
        /* No need to order as the groups layout does not exist */
        state.form.groupsLayout = [];
      } else {
        state.form.groups = orderGroups(state.form.groups, state.form.groupsLayout);
      }

      state.isPublished = false;
      state.name = "";
      state.deliveryOption = undefined;
      state.formPurpose = "";
      state.publishReason = "";
      state.publishFormType = "";
      state.publishDesc = "";
      state.closingDate = null;
    });
  };
