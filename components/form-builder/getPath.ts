export const parseId = (id: number) => {
  // split 4 digit id into 2 digits
  const idStr = id.toString();
  const idArr = idStr.split("");
  const first = idArr.slice(0, 2).join("");
  return Number(first);
};

export const getPath = (elements: any, id: number) => {
  const elId = parseId(id);
  const parentIndex = elements.findIndex((el: any) => el.id === elId);

  if (parentIndex === -1) return [null, null];

  if (elements[parentIndex] && elements[parentIndex].properties?.subElements) {
    const subIndex = elements[parentIndex].properties.subElements.findIndex(
      (el: any) => el.id === id
    );
    return subIndex > -1 ? [parentIndex, subIndex] : [parentIndex, null];
  }

  return [parentIndex, null];
};
