import { type FormElement, type FormProperties, type Group, type GroupsType } from "@gcforms/types";

export interface FormElementHash {
  [key: string]: FormElement;
}

const getFormElementCollection = (form: FormProperties): FormElementHash => {
  const elementCollection: FormElementHash = {};
  if (form.elements === undefined) return elementCollection;

  for (const element of form.elements) {
    elementCollection[element.id] = element;
  }

  return elementCollection;
};

export const sortGroup = ({ form, group }: { form: FormProperties; group: Group }) => {
  const elementCollection = getFormElementCollection(form);
  const sortedElements: FormElement[] = [];

  if (!group.elements) return sortedElements;

  const groupElements = group.elements.map((elementId) => elementCollection[elementId]);
  sortedElements.push(...groupElements);

  return sortedElements;
};

export const getLayoutFromGroups = (form: FormProperties, groups: GroupsType): number[] => {
  const layout: number[] = [];
  const elementCollection = getFormElementCollection(form);

  for (const key in groups) {
    if (Object.prototype.hasOwnProperty.call(groups, key)) {
      const group = groups[key];
      if (group.elements === undefined) return [];
      group.elements.forEach((elementId) => {
        layout.push(elementCollection[elementId].id);
      });
    }
  }

  return layout;
};

export const sortByLayout = ({
  layout,
  elements,
}: {
  layout: number[];
  elements: FormElement[];
}) => {
  return [...elements].sort((a, b) => layout.indexOf(a.id) - layout.indexOf(b.id));
};

export const sortByGroups = ({
  form,
  elements,
}: {
  form: FormProperties;
  elements: FormElement[];
}) => {
  if (!form.groups) {
    return sortByLayout({ layout: form.layout, elements });
  }

  const layout = getLayoutFromGroups(form, form.groups);
  return sortByLayout({ layout, elements });
};
