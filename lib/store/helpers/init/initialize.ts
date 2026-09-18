import { type TemplateStore } from "../../types";
import { initializeGroups } from "@root/lib/groups/utils/initializeGroups";
import { defaultForm } from "../../defaults";
import { Language } from "../../../types/form-builder-types";
import { orderGroups } from "@lib/utils/form-builder/orderUsingGroupsLayout";
import { NotificationsIntervalDefault } from "@gcforms/types";
import { CURRENT_TEMPLATE_VERSION } from "@lib/templates/schemaVersioning/migrations";

export const initialize: TemplateStore<"initialize"> =
  (set) =>
  (language = "en") => {
    set((state) => {
      state.id = "";
      state.lang = language as Language;
      state.translationLanguagePriority = language as Language;
      state.form = initializeGroups({ ...defaultForm });
      // Brand new template, not migrated data - stamp the current version directly.
      state.form.version = CURRENT_TEMPLATE_VERSION;

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
      state.saveAndResume = true;
      state.notificationsInterval = NotificationsIntervalDefault;
    });
  };
