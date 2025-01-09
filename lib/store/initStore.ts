import { TemplateStoreProps, InitialTemplateStoreProps } from "./types";
import { Language } from "../types/form-builder-types";
import { defaultForm } from "./defaults";
import { initializeGroups } from "@formBuilder/components/shared/right-panel/treeview/util/initializeGroups";
import { orderGroups } from "@lib/utils/form-builder/orderUsingGroupsLayout";

export const initStore = (initProps?: Partial<InitialTemplateStoreProps>) => {
  const DEFAULT_PROPS: TemplateStoreProps = {
    id: "",
    lang: (initProps?.locale as Language) || "en",
    translationLanguagePriority: (initProps?.locale as Language) || "en",
    focusInput: false,
    hasHydrated: false,
    form: defaultForm,
    isPublished: false,
    name: "",
    securityAttribute: "Protected A",
    formPurpose: "",
    publishReason: "",
    publishFormType: "",
    publishDesc: "",
    closingDate: initProps?.closingDate,
    changeKey: String(new Date().getTime()),
    allowGroupsFlag: initProps?.allowGroupsFlag || false,
  };

  // Ensure any required properties by Form Builder are defaulted by defaultForm
  if (initProps?.form) {
    initProps.form = {
      ...defaultForm,
      ...initProps?.form,
    };

    initProps.form = initializeGroups(initProps.form, initProps?.allowGroupsFlag || false);

    // Ensure order by groups layout
    if (!initProps.form.groupsLayout) {
      /* No need to order as the groups layout does not exist */
      initProps.form.groupsLayout = [];
    } else {
      initProps.form.groups = orderGroups(initProps.form.groups, initProps.form.groupsLayout);
    }
  }

  return {
    ...DEFAULT_PROPS,
    ...initProps,
  };
};
