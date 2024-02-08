import { PropertyChoices } from "@lib/types";
import { departments, Department } from "./departments";

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
  departments: departments.filters.departments(departments.values),
};
