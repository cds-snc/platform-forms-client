import { PropertyChoices } from "@lib/types";
import { organizations, Department } from "./departments";

export type ManagedDataSets = {
  departments: ManagedDataSet<Department[]>;
};

export type ManagedDataSet<T> = {
  values: T;
  filters: {
    [key: string]: (values: T) => PropertyChoices[];
  };
};

type ManagedData = {
  [key: string]: PropertyChoices[];
};

export const managedData: ManagedData = {
  departments: organizations.filters.departments(organizations.values),
};
