import { ManagedDataSet } from ".";
import organizationsData from "./data/organizations.json";

export type Department = {
  type: string;
  name_eng: string;
  name_fra: string;
  [key: string]: string | null;
};

export const organizations: ManagedDataSet<Department[]> = {
  values: organizationsData,
  filters: {
    departments: (values: Department[]) =>
      values
        .filter((item) => item.type === "GC Department")
        .map((item) => ({
          en: item.name_eng,
          fr: item.name_fra,
        })),
    crownCorporations: (values: Department[]) =>
      values
        .filter((item) => item.type === "Crown Corp")
        .map((item) => ({
          en: item.name_eng,
          fr: item.name_fra,
        })),
    provincialTerritorial: (values: Department[]) =>
      values
        .filter((item) => item.type === "PTM")
        .map((item) => ({
          en: item.name_eng,
          fr: item.name_fra,
        })),
  },
};
