export const getPreviousIndex = (items, index) => {
  return index === 0 ? items.length - 1 : index - 1;
};

export const getNextIndex = (items, index) => {
  return index === items.length - 1 ? 0 : index + 1;
};

export const removeElementById = (items, id) => {
  return items.filter((item) => {
    return item.id !== id;
  });
};

export const moveUp = (items, index) => {
  const previous = getPreviousIndex(items, index);
  return [...swap(items, index, previous)];
};

export const moveDown = (items, index) => {
  const next = getNextIndex(items, index);
  return [...swap(items, index, next)];
};

export const swap = (arr, index1, index2) => {
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

export const incrementElementId = (elements) => {
  if (!elements || !elements.length) {
    return 1;
  }
  const ids = elements.map((element) => element.id).sort((a, b) => a - b);
  return ids[ids.length - 1] + 1;
};

export const sortByLayout = ({ layout, elements }) => {
  return elements.sort((a, b) => {
    return layout.indexOf(a.id) - layout.indexOf(b.id);
  });
};
