import { Group, GroupsType } from "@lib/formContext";
import { FormElement, FormProperties } from "@lib/types";

export interface IFormElementHash {
  [key: string]: FormElement;
}

// Returns the elements of a group in the order they are in the form as defined by group.
export const sortGroup = ({ form, group }: { form: FormProperties; group: Group }) => {
  const elementCollection: IFormElementHash = getFormElementCollection(form);
  const sortedElements: FormElement[] = [];

  if (!group.elements) return sortedElements;

  const groupElements = group.elements.map((elId) => {
    return elementCollection[elId];
  });

  sortedElements.push(...groupElements);

  return sortedElements;
};

//----
//TODO: Move this into the template store, and use the template store to get the the collection of elements.
// move the elementHash as a property in the store, so it sits in memory and doesn't need to be reprocessed.
//----
// Build a Hash of Form Elements, for quick access.
export const getFormElementCollection = (form: FormProperties) => {
  const elementCollection: IFormElementHash = {};
  if (form.elements === undefined) return elementCollection;

  for (let i = 0; i < form.elements.length; i++) {
    const element = form.elements[i];
    elementCollection[element.id] = element;
  }
  return elementCollection;
};

// A Helper function for loading the old layout.
export const getLayoutFromGroups = (form: FormProperties, groups: GroupsType) => {
  const layout: number[] = [];
  const elementCollection: IFormElementHash = getFormElementCollection(form);

  // loop over each group and it elements array and push the elements id to the layout array
  for (const key in groups) {
    if (Object.prototype.hasOwnProperty.call(groups, key)) {
      const group: Group = groups[key];
      if (group.elements === undefined) return elementCollection;
      group.elements.forEach((element: string) => {
        layout.push(elementCollection[element].id);
      });
    }
  }

  return layout;
};
