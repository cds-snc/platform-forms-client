import { PropertyChoices } from "@lib/types";
import { organizations, Organization } from "./organizations";

export type ManagedDataSets = {
  departments: ManagedDataSet<Organization[]>;
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
  crownCorporations: organizations.filters.crownCorporations(organizations.values),
  provincialTerritorial: organizations.filters.provincialTerritorial(organizations.values),
};
