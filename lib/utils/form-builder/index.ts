import { FormElement, FormProperties, FormElementTypes, DeliveryOption } from "@lib/types";
import { TemplateStoreState } from "../../store/types";
import { GroupsType } from "@lib/formContext";
import { getLayoutFromGroups } from "./groupedFormHelpers";
import { formHasGroups } from "./formHasGroups";

export const completeEmailAddressRegex =
  /^([a-zA-Z0-9!#$%&'*+-/=?^_`{|}~.])+@([a-zA-Z0-9-.]+)\.([a-zA-Z0-9]{2,})+$/;

export const getPreviousIndex = (items: number[] | FormElement[], index: number) => {
  return index === 0 ? items.length - 1 : index - 1;
};

export const getNextIndex = (items: number[] | FormElement[], index: number) => {
  return index === items.length - 1 ? 0 : index + 1;
};

export const removeById = (items: number[], searchId: number) => {
  return items.filter((val) => {
    return searchId !== val;
  });
};

export const removeElementById = (items: FormElement[], id: number) => {
  return items.filter((item) => {
    return item.id !== id;
  });
};

export const moveUp = (items: number[], index: number) => {
  const previous = getPreviousIndex(items, index);
  return [...swap(items, index, previous)];
};

export const moveDown = (items: number[], index: number) => {
  const next = getNextIndex(items, index);
  return [...swap(items, index, next)];
};

export const swap = (arr: number[], index1: number, index2: number) => {
  [arr[index2], arr[index1]] = [arr[index1], arr[index2]];
  return arr;
};

export const moveElementUp = (items: FormElement[], index: number) => {
  const previous = getPreviousIndex(items, index);
  return [...swapElement(items, index, previous)];
};

export const moveElementDown = (items: FormElement[], index: number) => {
  const next = getNextIndex(items, index);
  return [...swapElement(items, index, next)];
};

export const swapElement = (arr: FormElement[], index1: number, index2: number) => {
  const a = { ...arr[index1] };
  const b = { ...arr[index2] };

  return arr.map((item, i) => {
    if (i === index1) {
      item = b;
    }
    if (i === index2) {
      item = a;
    }

    return item;
  });
};

export const incrementSubElementId = (subElements: FormElement[], elId: number) => {
  if (!subElements || !subElements.length) {
    return Number(elId.toString() + "01");
  }
  const ids = subElements.map((element) => element.id).sort((a, b) => a - b);

  return ids[ids.length - 1] + 1;
};

export const sortByLayout = ({
  layout,
  elements,
}: {
  layout: number[];
  elements: FormElement[];
}) => {
  return [...elements].sort((a, b) => {
    return layout.indexOf(a.id) - layout.indexOf(b.id);
  });
};

export const sortByGroups = ({
  form,
  elements,
}: {
  form: FormProperties;
  elements: FormElement[];
}) => {
  if (!form.groups) {
    return sortByLayout({ layout: form.layout, elements: elements });
  }

  const layout = getLayoutFromGroups(form, form.groups);
  return sortByLayout({ layout, elements });
};

export const getSchemaFromState = (state: TemplateStoreState, allowGroups = false) => {
  const {
    form: {
      titleEn,
      titleFr,
      introduction,
      privacyPolicy,
      confirmation,
      elements,
      brand,
      securityAttribute,
      layout,
      groups,
      groupsLayout,
      lastGeneratedElementId,
    },
  } = state;

  const form: FormProperties = {
    titleEn,
    titleFr,
    introduction,
    privacyPolicy,
    confirmation,
    layout,
    elements,
    securityAttribute,
    brand,
    groups,
    groupsLayout,
    lastGeneratedElementId,
  };

  // Force this is off until a enable in a follow-up PR
  const sortUsingGroups = allowGroups;

  if (sortUsingGroups && formHasGroups(form)) {
    const groups = form.groups as GroupsType;
    form.layout = getLayoutFromGroups(form, groups);
  }

  return form;
};

export const timeFr = (updatedAt: number | undefined, locale = "fr-CA") => {
  const date = new Date(updatedAt || 0);
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  };

  let timeStr = date.toLocaleDateString(locale, timeOptions);
  timeStr = timeStr.replace(timeStr.split(" ", 1)[0], "");
  return timeStr;
};

export const formatDateTime = (updatedAt: number | undefined, locale = "en-CA") => {
  const date = new Date(updatedAt || 0);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  // force this to be en-CA for now
  const localeString = date.toLocaleDateString("en-CA", options);

  const parts = localeString.split(",");

  if (parts.length < 2) {
    return [];
  }

  const yearMonthDay = parts[0];

  // en
  let time = parts[1].replace(/\./g, "").trim();
  // fr
  if (locale === "fr-CA") {
    time = timeFr(updatedAt, locale);
  }

  return [yearMonthDay, time];
};

export const formatDateTimeLong = (updatedAt: number | undefined, locale = "en-CA") => {
  const date = new Date(updatedAt || 0);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  return date.toLocaleDateString(locale, options);
};

// Note: GMT = UTC as far as date-time is concerned
export const formatDateTimeUTC = (timestamp: number | undefined, includeSeconds = false) => {
  const arrayOffset = includeSeconds ? -5 : -8;
  const date = new Date(timestamp || 0);
  return date.toISOString().replace("T", " ").slice(0, arrayOffset) + " UTC";
};

export const formatDateTimeUTCFr = (timestamp: number | undefined) => {
  const date = formatDateTimeUTC(timestamp);
  const parts = date.split(" ");
  const dateParts = parts[0].split("-");
  const timeParts = parts[1].split(":");
  const formattedDate = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]} ${timeParts[0]}h ${timeParts[1]} UTC`;
  return formattedDate;
};

export const autoCompleteFields = [
  "name",
  "given-name",
  "additional-name",
  "family-name",
  "honorific-prefix",
  "honorific-suffix",
  "organization-title",
  "address-line1",
  "address-line2",
  "address-line3",
  "address-level2",
  "address-level1",
  "country",
  "country-name",
  "postal-code",
  "language",
  "bday",
  "bday-day",
  "bday-month",
  "bday-year",
  "url",
  "email",
  "tel",
];

// check if the type is being passed is a "text field" input but has a ƒspecific type
export const isValidatedTextType = (type: FormElementTypes | undefined) => {
  return type && ["email", "tel", "date", "number"].includes(type);
};

export const isAutoCompleteField = (type: string) => {
  return type && autoCompleteFields.includes(type);
};

export const getHost = () => {
  if (typeof window === "undefined") return "";
  return `${window.location.protocol}//${window.location.host}`;
};

export const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

interface ElementType {
  id: number;
  type: string;
}

export const getQuestionNumber = (item: FormElement, elements: ElementType[], alpha?: boolean) => {
  /* note we don't update the count when the item is richText */
  const itemIndex = elements
    .filter((object) => object.type !== "richText")
    .findIndex((object) => object.id === item.id);

  if (alpha) {
    return alphabet[itemIndex];
  }

  return itemIndex + 1;
};

export const allowedTemplates = [
  FormElementTypes.attestation,
  FormElementTypes.address,
  FormElementTypes.name,
  FormElementTypes.firstMiddleLastName,
  FormElementTypes.contact,
  FormElementTypes.departments,
] as const;

export type TemplateTypes = (typeof allowedTemplates)[number];

export const isVaultDelivery = (deliveryOption: DeliveryOption | undefined) => {
  return !deliveryOption;
};

export const isEmailDelivery = (deliveryOption: DeliveryOption | undefined) => {
  return !!(deliveryOption && deliveryOption.emailAddress);
};

export const padAngleBrackets = (value: string) => {
  const regex = /<(?!\s)(.*?)(?=\s*)>/g;
  return value.replace(regex, (match, p1) => {
    return `< ${p1.trim()} >`;
  });
};

type Cleanable = string | Cleanable[] | { [key: string]: Cleanable } | unknown;

export const cleanInput = <T extends Cleanable>(input: T): T => {
  if (typeof input === "string") {
    return padAngleBrackets(input) as T;
  }
  if (Array.isArray(input)) {
    return input.map((elem) => cleanInput(elem)) as T;
  }
  if (input instanceof Object) {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [key, cleanInput(value)])
    ) as T;
  }
  return input;
};

export const removeGroupElement = (
  groups: GroupsType | undefined,
  groupId: string,
  elementId: number
) => {
  if (groups) {
    const group = { ...groups[groupId] };
    if (!group) return groups;

    group.elements = group.elements.filter((el) => {
      return String(el) !== String(elementId);
    });

    if (groups) {
      groups[groupId] = { ...group };
    }

    return groups;
  }
};
