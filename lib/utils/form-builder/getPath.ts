export const parseRootId = (id: number, elements?: Element[]) => {
  if (!elements) return id;

  let rootId = id;

  elements.forEach((el) => {
    if (el.properties?.subElements) {
      el.properties.subElements.forEach((subEl) => {
        if (subEl.id === id) {
          rootId = el.id;
        }
      });
    }
  });

  return rootId;
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
  const elId = parseRootId(id, elements);

  const elIndex = elements.findIndex((el: T) => el.id === elId);

  if (elIndex === -1) return [null, null];

  const props = elements[elIndex].properties;

  if (props?.subElements) {
    const subIndex = props?.subElements.findIndex((el) => el.id === id) ?? -1;
    return subIndex > -1 ? [elIndex, subIndex] : [elIndex, null];
  }

  return [elIndex, null];
};

export const getParentIndex = (id: number, elements: Element[]) => {
  const parentIndexes = getElementIndexes(id, elements);

  if (!parentIndexes || parentIndexes[0] === null) {
    return;
  }

  const parentIndex = parentIndexes[0];

  return parentIndex;
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

export const getItemPathString = <T extends Element>(id: number, elements: T[]) => {
  const indexes = getElementIndexes(id, elements);
  const [elIndex, subIndex] = indexes;

  if (elIndex === null) return "";

  if (subIndex === null) return `form.elements[${elIndex}]`;

  return `form.elements[${elIndex}].properties.subElements[${subIndex}]`;
};
