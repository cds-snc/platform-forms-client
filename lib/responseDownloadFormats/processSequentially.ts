export const processSequentially = async <T>(
  items: readonly T[],
  processItem: (item: T, index: number) => Promise<void>
) => {
  await items.reduce<Promise<void>>(
    (queue, item, index) => queue.then(() => processItem(item, index)),
    Promise.resolve()
  );
};
