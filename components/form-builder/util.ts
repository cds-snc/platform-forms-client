import { Language } from "./types";
import { FormElement, FormProperties, FormRecord, PropertyChoices } from "@lib/types";
import { TemplateStoreState } from "./store/useTemplateStore";

export const getPreviousIndex = (items: FormElement[], index: number) => {
  return index === 0 ? items.length - 1 : index - 1;
};

export const getNextIndex = (items: FormElement[], index: number) => {
  return index === items.length - 1 ? 0 : index + 1;
};

export const removeElementById = (items: FormElement[], id: number) => {
  return items.filter((item) => {
    return item.id !== id;
  });
};

export const moveUp = (items: FormElement[], index: number) => {
  const previous = getPreviousIndex(items, index);
  return [...swap(items, index, previous)];
};

export const moveDown = (items: FormElement[], index: number) => {
  const next = getNextIndex(items, index);
  return [...swap(items, index, next)];
};

export const swap = (arr: FormElement[], index1: number, index2: number) => {
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

export const incrementElementId = (elements: FormElement[]) => {
  if (!elements || !elements.length) {
    return 1;
  }
  const ids = elements.map((element) => element.id).sort((a, b) => a - b);
  return ids[ids.length - 1] + 1;
};

export const sortByLayout = ({
  layout,
  elements,
}: {
  layout: number[];
  elements: FormElement[];
}) => {
  return elements.sort((a, b) => {
    return layout.indexOf(a.id) - layout.indexOf(b.id);
  });
};

export const newlineToOptions = (
  lang: Language,
  currentChoices: PropertyChoices[] = [],
  bulkChoices: string
) => {
  const cleanedBulkChoices = bulkChoices.endsWith("\n") ? bulkChoices.slice(0, -1) : bulkChoices;
  const choices = cleanedBulkChoices.split("\n");

  let newChoices = [...currentChoices];

  choices.forEach((choice, i) => {
    if (newChoices[i] !== undefined) {
      newChoices[i][lang] = choice;
    } else {
      if (choice == "") return;

      const obj = { en: "", fr: "" };
      obj[lang] = choice;
      newChoices.push(obj);
    }
  });

  // truncate the "old" choices to remove left overs
  newChoices = newChoices.slice(0, choices.length);

  return newChoices;
};

export const getSchemaFromState = (state: TemplateStoreState) => {
  const {
    id,
    form: {
      endPage,
      introduction,
      privacyPolicy,
      elements,
      titleEn,
      titleFr,
      version,
      emailSubjectEn,
      emailSubjectFr,
    },
    submission,
    securityAttribute,
  } = state;

  const form: FormProperties = {
    layout: [],
    endPage,
    introduction,
    privacyPolicy,
    titleEn,
    titleFr,
    version,
    elements,
    emailSubjectEn,
    emailSubjectFr,
  };

  form.layout = elements.map((element) => {
    return element.id;
  });

  const schema: Partial<FormRecord> = {
    id,
    form,
    submission,
    securityAttribute,
  };

  return schema;
};

// @todo this will need to be updated to support other locales i.e. fr-CA
export const formatDateTime = (updatedAt: number | undefined, locale = "en-CA") => {
  const date = new Date(updatedAt || 0);
  const options: Intl.DateTimeFormatOptions = {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  const localeString = date.toLocaleDateString(locale, options);
  const parts = localeString.split(",");

  if (parts.length < 2) {
    return [];
  }

  const yearMonthDay = parts[0].replace(/-/g, "/");
  const time = parts[1].replace(/\./g, "").trim();
  return [yearMonthDay, time];
};
