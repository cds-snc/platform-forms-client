export function updateArrayOrder<T>(arr: T[], position: number, nextPosition: number): T[] {
  // Create a copy of the array
  const newArr = [...arr];
  // Move the element to the new position
  const [removed] = newArr.splice(position, 1);
  newArr.splice(nextPosition, 0, removed);

  return newArr;
}
