export const STORAGE_KEY = {
  USER: "gcforms-user",
};

export function getStorageValue(key: string) {
  const saved = sessionStorage.getItem(key);
  const initial = saved && JSON.parse(saved);
  return initial || "";
}

export function setStorageValue(key: string, value: { [key: string]: string | number } | null) {
  sessionStorage.setItem(key, JSON.stringify(value));
}
