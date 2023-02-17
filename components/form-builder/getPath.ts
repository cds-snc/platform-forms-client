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
  return parentIndex > -1 ? parentIndex : null;

  // @todo get subIndex
};
