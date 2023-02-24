export const parseRootId = (id: number) => {
  // split 3 or 4 digit id into first 1 or 2 digits
  const idStr = id.toString();
  const sliceAt = idStr.length == 3 ? 1 : 2;
  const idArr = idStr.split("");
  const first = idArr.slice(0, sliceAt).join("");
  return Number(first);
};

interface Form {
  elements: Element[];
}

interface Element {
  id: number;
  properties?: {
    subElements?: Element[];
    titleEn?: string;
    titleFr?: string;
    descriptionEn?: string;
    descriptionFr?: string;
  };
}

type Indexes = [] | [elIndex: number | null, subIndex: number | null];

export const getElementIndexes = <T extends Element>(id: number, elements: T[]): Indexes => {
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

export const indexesToPath = <T extends Form>(indexes: Indexes, form: T) => {
  const [elIndex, subIndex] = indexes;

  if (elIndex === null) return [null, null];

  const path = form.elements[Number(elIndex)];

  if (subIndex === null) return [path, null];

  const subPath = path.properties?.subElements?.[Number(subIndex)];

  return subPath ? [path, subPath] : [path, null];
};

export const getPath = <T extends Form>(id: number, form: T) => {
  const indexes = getElementIndexes(id, form.elements);
  const [elIndex, subIndex] = indexesToPath(indexes, form);

  if (subIndex) {
    return subIndex;
  }

  return elIndex;
};

export const getPathString = <T extends Element>(id: number, elements: T[]) => {
  const indexes = getElementIndexes(id, elements);
  const [elIndex, subIndex] = indexes;

  if (elIndex === null) return "";

  if (subIndex === null) return `form.elements[${elIndex}].properties`;

  return `form.elements[${elIndex}].properties.subElements[${subIndex}].properties`;
};
