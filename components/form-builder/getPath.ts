export const parseRootId = (id: number) => {
  // split 3 or 4 digit id parent id
  const idStr = id.toString();
  const sliceAt = idStr.length == 3 ? 1 : 2;
  const idArr = idStr.split("");
  const first = idArr.slice(0, sliceAt).join("");
  return Number(first);
};

export interface Element {
  id: number;
  properties?: {
    subElements?: Element[];
  };
}

export const getElementIndexes = <T extends Element>(elements: T[], id: number) => {
  const elId = parseRootId(id);
  const elIndex = elements.findIndex((el: T) => el.id === elId);

  if (elIndex === -1) return [null, null];

  const props = elements[elIndex].properties;

  if (props?.subElements) {
    const subIndex = props?.subElements.findIndex((el) => el.id === id) ?? -1;
    return subIndex > -1 ? [elIndex, subIndex] : [elIndex, null];
  }

  return [elIndex, null];
};
