interface Element {
  id: string | number;
}

export function reorderElements<T extends Element>(elementOrder: string[], elements: T[]): T[] {
  let arr = elementOrder.map((id) => {
    const item = elements.find((element) => element.id === Number(id));
    if (item) {
      return {
        ...item,
      };
    }
  });

  // filter out undefined items
  arr = arr.filter((item) => item);
  return arr as T[];
}
