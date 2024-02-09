import { ManagedDataSet } from ".";
import organizationsData from "./data/organizations.json";

export type Organization = {
  type: string;
  name_eng: string;
  name_fra: string;
  [key: string]: string | null;
};

export const organizations: ManagedDataSet<Organization[]> = {
  values: organizationsData,
  filters: {
    departments: (values: Organization[]) =>
      values
        .filter((item) => item.type === "GC Department")
        .map((item) => ({
          en: item.name_eng,
          fr: item.name_fra,
        })),
    crownCorporations: (values: Organization[]) =>
      values
        .filter((item) => item.type === "Crown Corp")
        .map((item) => ({
          en: item.name_eng,
          fr: item.name_fra,
        })),
    provincialTerritorial: (values: Organization[]) =>
      values
        .filter((item) => item.type === "PTM")
        .map((item) => ({
          en: item.name_eng,
          fr: item.name_fra,
        })),
  },
};
