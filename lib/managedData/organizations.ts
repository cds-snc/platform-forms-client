import { ManagedDataSet } from ".";
import organizationsData from "./data/organizations.json";

export type Organization = {
  type: string;
  name_eng: string;
  name_fra: string;
  [key: string]: string | null;
};

enum OrganizationType {
  GCDepartment = "GC Department",
  CrownCorp = "Crown Corp",
  PTM = "PTM",
}

export const organizations: ManagedDataSet<Organization[]> = {
  values: organizationsData,
  filters: {
    departments: (values: Organization[]) =>
      values
        .filter((item) => item.type === OrganizationType.GCDepartment)
        .map((item) => ({
          en: item.name_eng,
          fr: item.name_fra,
        })),
    crownCorporations: (values: Organization[]) =>
      values
        .filter((item) => item.type === OrganizationType.CrownCorp)
        .map((item) => ({
          en: item.name_eng,
          fr: item.name_fra,
        })),
    provincialTerritorial: (values: Organization[]) =>
      values
        .filter((item) => item.type === OrganizationType.PTM)
        .map((item) => ({
          en: item.name_eng,
          fr: item.name_fra,
        })),
  },
};
