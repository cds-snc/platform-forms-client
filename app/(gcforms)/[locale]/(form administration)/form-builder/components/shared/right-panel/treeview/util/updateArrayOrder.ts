export function updateArrayOrder<T>(arr: T[], position: number, nextPosition: number): T[] {
  // Create a copy of the array
  const newArr = [...arr];

  // Swap array positions
  const temp = newArr[position];
  newArr[position] = newArr[nextPosition];
  newArr[nextPosition] = temp;

  return newArr;
}
