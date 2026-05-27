"use client";
import { useTranslation } from "@i18n/client";
import {
  CheckIcon,
  ParagraphIcon,
  RadioIcon,
  SelectMenuIcon,
  ShortAnswerIcon,
  AddIcon,
  ContactIcon,
  AddressIcon,
  NameIcon,
  UploadIcon,
  GavelIcon,
  DepartmentsIcon,
} from "@serverComponents/icons";
import dynamic from "next/dynamic";

import { useIsAdminUser } from "./useIsAdminUser";
import { useFormBuilderConfig } from "@lib/hooks/useFormBuilderConfig";

import { ElementOptionsFilter, ElementOption } from "../../types/form-builder-types";
import { useFeatureFlags } from "../useFeatureFlags";
import { FeatureFlags } from "@lib/cache/types";
import { FormElementTypes } from "@lib/types";
import { getClientElementDefinition } from "@lib/form-elements/registry";

// Loading component for lazy-loaded descriptions
const DescriptionLoading = () => (
  <div className="mt-10 flex items-center justify-center">
    <div className="size-20 animate-spin rounded-full border-y-4 border-indigo-700"></div>
  </div>
);

// Lazy load all description components
const TextField = dynamic(
  () =>
    import("@formBuilder/[id]/edit/components/elements/element-dialog/descriptions/TextField").then(
      (mod) => ({ default: mod.TextField })
    ),
  { ssr: false, loading: () => <DescriptionLoading /> }
);
const TextArea = dynamic(
  () =>
    import("@formBuilder/[id]/edit/components/elements/element-dialog/descriptions/TextArea").then(
      (mod) => ({ default: mod.TextArea })
    ),
  { ssr: false, loading: () => <DescriptionLoading /> }
);
const RichText = dynamic(
  () =>
    import("@formBuilder/[id]/edit/components/elements/element-dialog/descriptions/RichText").then(
      (mod) => ({ default: mod.RichText })
    ),
  { ssr: false, loading: () => <DescriptionLoading /> }
);
const Radio = dynamic(
  () =>
    import("@formBuilder/[id]/edit/components/elements/element-dialog/descriptions/Radio").then(
      (mod) => ({ default: mod.Radio })
    ),
  { ssr: false, loading: () => <DescriptionLoading /> }
);
const CheckBox = dynamic(
  () =>
    import("@formBuilder/[id]/edit/components/elements/element-dialog/descriptions/CheckBox").then(
      (mod) => ({ default: mod.CheckBox })
    ),
  { ssr: false, loading: () => <DescriptionLoading /> }
);
const DropDown = dynamic(
  () =>
    import("@formBuilder/[id]/edit/components/elements/element-dialog/descriptions/DropDown").then(
      (mod) => ({ default: mod.DropDown })
    ),
  { ssr: false, loading: () => <DescriptionLoading /> }
);
const QuestionSet = dynamic(
  () =>
    import("@formBuilder/[id]/edit/components/elements/element-dialog/descriptions/QuestionSet").then(
      (mod) => ({ default: mod.QuestionSet })
    ),
  { ssr: false, loading: () => <DescriptionLoading /> }
);
const Attestation = dynamic(
  () =>
    import("@formBuilder/[id]/edit/components/elements/element-dialog/descriptions/Attestation").then(
      (mod) => ({ default: mod.Attestation })
    ),
  { ssr: false, loading: () => <DescriptionLoading /> }
);
const Address = dynamic(
  () =>
    import("@formBuilder/[id]/edit/components/elements/element-dialog/descriptions/Address").then(
      (mod) => ({ default: mod.Address })
    ),
  { ssr: false, loading: () => <DescriptionLoading /> }
);
const AddressComplete = dynamic(
  () =>
    import("@formBuilder/[id]/edit/components/elements/element-dialog/descriptions/AddressComplete").then(
      (mod) => ({ default: mod.AddressComplete })
    ),
  { ssr: false, loading: () => <DescriptionLoading /> }
);
const Name = dynamic(
  () =>
    import("@formBuilder/[id]/edit/components/elements/element-dialog/descriptions/Name").then(
      (mod) => ({ default: mod.Name })
    ),
  { ssr: false, loading: () => <DescriptionLoading /> }
);
const Contact = dynamic(
  () =>
    import("@formBuilder/[id]/edit/components/elements/element-dialog/descriptions/Contact").then(
      (mod) => ({ default: mod.Contact })
    ),
  { ssr: false, loading: () => <DescriptionLoading /> }
);
const FirstMiddleLastName = dynamic(
  () =>
    import("@formBuilder/[id]/edit/components/elements/element-dialog/descriptions/FirstMiddleLastName").then(
      (mod) => ({ default: mod.FirstMiddleLastName })
    ),
  { ssr: false, loading: () => <DescriptionLoading /> }
);
const FileInput = dynamic(
  () =>
    import("@formBuilder/[id]/edit/components/elements/element-dialog/descriptions/FileInput").then(
      (mod) => ({ default: mod.FileInput })
    ),
  { ssr: false, loading: () => <DescriptionLoading /> }
);
const Departments = dynamic(
  () =>
    import("@formBuilder/[id]/edit/components/elements/element-dialog/descriptions/Departments").then(
      (mod) => ({ default: mod.Departments })
    ),
  { ssr: false, loading: () => <DescriptionLoading /> }
);
const Combobox = dynamic(
  () =>
    import("@formBuilder/[id]/edit/components/elements/element-dialog/descriptions/Combobox").then(
      (mod) => ({ default: mod.Combobox })
    ),
  { ssr: false, loading: () => <DescriptionLoading /> }
);
const CustomJson = dynamic(
  () =>
    import("@formBuilder/[id]/edit/components/elements/element-dialog/descriptions/CustomJson").then(
      (mod) => ({ default: mod.CustomJson })
    ),
  { ssr: false, loading: () => <DescriptionLoading /> }
);

export const Groups = {
  BASIC: "basic",
  PRESET: "preset",
  OTHER: "other",
} as const;
export type Groups = (typeof Groups)[keyof typeof Groups];

export const useElementOptions = (filterElements?: ElementOptionsFilter | undefined) => {
  const { t } = useTranslation("form-builder");
  const groups = {
    basic: { id: "basic", value: t("addElementDialog.categories.basic") },
    preset: { id: "preset", value: t("addElementDialog.categories.preset") },
    other: { id: "other", value: t("addElementDialog.categories.other") },
  };

  const sortElements = (elementOptions: ElementOption[]) => {
    return elementOptions.sort((a, b) => {
      const order = Object.keys(groups);
      const groupOrder = order.indexOf(a.group.id) - order.indexOf(b.group.id);

      if (groupOrder !== 0) {
        return groupOrder;
      }

      const aDisplayOrder = a.displayOrder ?? globalThis.Number.MAX_SAFE_INTEGER;
      const bDisplayOrder = b.displayOrder ?? globalThis.Number.MAX_SAFE_INTEGER;

      return aDisplayOrder - bDisplayOrder;
    });
  };

  const { getFlag } = useFeatureFlags();

  const isAdminUser = useIsAdminUser() ?? false;
  const { hasApiKeyId } = useFormBuilderConfig();

  // Custom json is only available to admin users
  const allowCustomJson = isAdminUser;

  const customJsonOption: ElementOption = {
    id: "customJson",
    value: t("addElementDialog.customJson.label"),
    icon: AddIcon,
    description: CustomJson,
    className: "",
    group: groups.other,
  };

  // Check feature flag for Address Complete
  const allowAddressComplete = getFlag(FeatureFlags.addressComplete);

  const addressCompleteOptions: ElementOption = {
    id: "addressComplete",
    value: t("addElementDialog.addressComplete.label"),
    icon: AddressIcon,
    description: AddressComplete,
    className: "",
    group: groups.preset,
  };

  const addressOptions: ElementOption = {
    id: "address",
    value: t("addElementDialog.address.label"),
    icon: AddressIcon,
    description: Address,
    className: "",
    group: groups.preset,
  };

  const getRegisteredElementOption = (type: FormElementTypes) => {
    const definition = getClientElementDefinition(type);
    const includeResult = definition?.includeIf?.({
      getFlag,
      isAdminUser,
      hasApiKeyId,
    });

    if (includeResult === false) {
      return null;
    }

    return (
      definition?.buildAddElementOption?.({
        t,
        groups,
      }) ?? null
    );
  };

  const formattedDateOption = getRegisteredElementOption(FormElementTypes.formattedDate);
  const numberInputOption = getRegisteredElementOption(FormElementTypes.numberInput);

  const elementOptions: ElementOption[] = [
    {
      id: "richText",
      value: t("richText"),
      icon: ParagraphIcon,
      description: RichText,
      className: "",
      group: groups.other,
    },
    {
      id: "textField",
      value: t("shortAnswer"),
      icon: ShortAnswerIcon,
      description: TextField,
      className: "",
      group: groups.basic,
    },
    {
      id: "textArea",
      value: t("paragraph"),
      icon: ParagraphIcon,
      description: TextArea,
      className: "separator",
      group: groups.basic,
    },
    {
      id: "radio",
      value: t("singleChoice"),
      icon: RadioIcon,
      description: Radio,
      className: "",
      group: groups.basic,
    },
    {
      id: "checkbox",
      value: t("checkboxes"),
      icon: CheckIcon,
      description: CheckBox,
      className: "",
      group: groups.basic,
    },
    {
      id: "dropdown",
      value: t("dropdown"),
      icon: SelectMenuIcon,
      description: DropDown,
      className: "",
      group: groups.basic,
    },
    {
      id: "combobox",
      value: t("combobox"),
      icon: SelectMenuIcon,
      description: Combobox,
      className: "",
      group: groups.basic,
    },
    {
      id: "fileInput",
      value: t("addElementDialog.fileInput.title"),
      icon: UploadIcon,
      description: FileInput,
      className: "",
      group: groups.other,
    },
    {
      id: "attestation",
      value: t("attestation"),
      icon: GavelIcon,
      description: Attestation,
      className: "separator",
      group: groups.basic,
    },
    {
      id: "name",
      value: t("addElementDialog.name.label"),
      icon: NameIcon,
      description: Name,
      group: groups.preset,
    },
    {
      id: "firstMiddleLastName",
      value: t("addElementDialog.firstMiddleLastName.label"),
      icon: NameIcon,
      description: FirstMiddleLastName,
      className: "",
      group: groups.preset,
    },
    ...(formattedDateOption ? [formattedDateOption] : []),
    {
      id: "contact",
      value: t("addElementDialog.contact.label"),
      icon: ContactIcon,
      description: Contact,
      group: groups.preset,
    },
    ...(allowAddressComplete
      ? [{ ...(addressCompleteOptions as ElementOption) }]
      : [{ ...(addressOptions as ElementOption) }]),
    {
      id: "departments",
      value: t("addElementDialog.departments.title"),
      icon: DepartmentsIcon,
      description: Departments,
      className: "",
      group: groups.preset,
    },
    ...(numberInputOption ? [numberInputOption] : []),
    {
      id: "dynamicRow",
      value: t("dyanamicRow"),
      icon: AddIcon,
      description: QuestionSet,
      className: "",
      group: groups.other,
    },
    ...(allowCustomJson ? [{ ...(customJsonOption as ElementOption) }] : []),
  ];

  return filterElements
    ? sortElements(filterElements(elementOptions))
    : sortElements(elementOptions);
};
