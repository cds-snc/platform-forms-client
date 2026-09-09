import { useSyncExternalStore } from "react";

const subscribeToHydration = () => () => {};
const getHydratedSnapshot = () => true;
const getServerSnapshot = () => false;

export const useIsHydrated = () =>
  useSyncExternalStore(subscribeToHydration, getHydratedSnapshot, getServerSnapshot);
