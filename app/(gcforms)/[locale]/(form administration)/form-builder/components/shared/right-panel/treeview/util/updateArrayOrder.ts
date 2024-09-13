export function updateArrayOrder<T>(arr: T[], position: number, nextPosition: number): T[] {
  // Swap array positions
  const temp = arr[position];
  arr[position] = arr[nextPosition];
  arr[nextPosition] = temp;
  return arr;
}
