import { Language, Choice, ElementType, FormSchema, TemplateSchema } from "./types";

export const getPreviousIndex = (items: ElementType[], index: number) => {
  return index === 0 ? items.length - 1 : index - 1;
};

export const getNextIndex = (items: ElementType[], index: number) => {
  return index === items.length - 1 ? 0 : index + 1;
};

export const removeElementById = (items: ElementType[], id: number) => {
  return items.filter((item) => {
    return item.id !== id;
  });
};

export const moveUp = (items: ElementType[], index: number) => {
  const previous = getPreviousIndex(items, index);
  return [...swap(items, index, previous)];
};

export const moveDown = (items: ElementType[], index: number) => {
  const next = getNextIndex(items, index);
  return [...swap(items, index, next)];
};

export const swap = (arr: ElementType[], index1: number, index2: number) => {
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

export const incrementElementId = (elements: ElementType[]) => {
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
  elements: ElementType[];
}) => {
  return elements.sort((a, b) => {
    return layout.indexOf(a.id) - layout.indexOf(b.id);
  });
};

export const newlineToOptions = (lang: Language, currentChoices: Choice[], bulkChoices: string) => {
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

export const getSchemaFromState = (state: TemplateSchema) => {
  const {
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
  } = state;

  const form: FormSchema = {
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

  const schema: TemplateSchema = {
    form,
    submission: { email: "test@test.com" },
    publishingStatus: true,
  };

  return schema;
};
