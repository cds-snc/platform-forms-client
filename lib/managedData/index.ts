import { PropertyChoices } from "@lib/types";
import departments from "./data/departments.json";

export enum ManagedData {
  DEPARTMENTS = "departments",
  CROWN_CORPORATIONS = "crownCorporations",
  PROVINCIAL_TERRITORIAL = "provincialTerritorial",
}

const filterDepartmentsData = (type: string) => {
  return departments
    .filter((item) => {
      return item.type === type;
    })
    .map((item) => ({
      en: item.name_eng,
      fr: item.name_fra,
    }));
};

export const getManagedData = (dataFile: ManagedData): Array<PropertyChoices> | null => {
  switch (dataFile) {
    case ManagedData.DEPARTMENTS:
      return filterDepartmentsData("GC Department");
    case ManagedData.CROWN_CORPORATIONS:
      return filterDepartmentsData("Crown Corp");
    case ManagedData.PROVINCIAL_TERRITORIAL:
      return filterDepartmentsData("PTM");
    default:
      throw new Error(`Unsupported data file: ${dataFile}`);
  }
};
