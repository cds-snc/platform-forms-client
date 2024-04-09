"use client";
import { useTranslation } from "@i18n/client";
import {
  CalendarIcon,
  CheckIcon,
  NumericFieldIcon,
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

import {
  RichText,
  Radio,
  CheckBox,
  DropDown,
  TextField,
  TextArea,
  Date,
  Number,
  QuestionSet,
  Attestation,
  Address,
  Name,
  Contact,
  FirstMiddleLastName,
  FileInput,
  Departments,
  Combobox,
} from "@formBuilder/[id]/edit/components/elements/element-dialog";
import { useIsAdminUser } from "./useIsAdminUser";
import { ElementOptionsFilter, ElementOption } from "../../types/form-builder-types";
import { useFlag } from "./useFlag";

export enum Groups {
  BASIC = "basic",
  PRESET = "preset",
  OTHER = "other",
}

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
      return order.indexOf(a.group.id) - order.indexOf(b.group.id);
    });
  };

  // default to off unless the user is an admin
  const allowFileInput = useIsAdminUser();

  const { status: experimentalBlocks } = useFlag("experimentalBlocks");

  const fileInputOption: ElementOption = {
    id: "fileInput",
    value: t("addElementDialog.fileInput.title"),
    icon: UploadIcon,
    description: FileInput,
    className: "",
    group: groups.other,
  };

  const repeatingSetsOption: ElementOption = {
    id: "dynamicRow",
    value: t("dyanamicRow"),
    icon: AddIcon,
    description: QuestionSet,
    className: "",
    group: groups.other,
  };

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
      className: "separator",
      group: groups.basic,
    },
    ...(allowFileInput ? [{ ...(fileInputOption as ElementOption) }] : []),
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
    {
      id: "contact",
      value: t("addElementDialog.contact.label"),
      icon: ContactIcon,
      description: Contact,
      group: groups.preset,
    },
    {
      id: "address",
      value: t("addElementDialog.address.label"),
      icon: AddressIcon,
      description: Address,
      className: "",
      group: groups.preset,
    },
    {
      id: "departments",
      value: t("addElementDialog.departments.title"),
      icon: DepartmentsIcon,
      description: Departments,
      className: "",
      group: groups.preset,
    },
    {
      id: "date",
      value: t("date"),
      icon: CalendarIcon,
      description: Date,
      className: "",
      group: groups.preset,
    },
    {
      id: "number",
      value: t("numericField"),
      icon: NumericFieldIcon,
      description: Number,
      className: "separator",
      group: groups.preset,
    },
    ...(experimentalBlocks ? [{ ...(repeatingSetsOption as ElementOption) }] : []),
  ];

  return filterElements
    ? sortElements(filterElements(elementOptions))
    : sortElements(elementOptions);
};
