export const LOCAL_STORAGE_KEY = {
  USER: "gcforms-user",
};

export function getStorageValue(key: string) {
  const saved = localStorage.getItem(key);
  const initial = saved && JSON.parse(saved);
  return initial || "";
}

export function setStorageValue(key: string, value: { [key: string]: string | number } | null) {
  localStorage.setItem(key, JSON.stringify(value));
}
