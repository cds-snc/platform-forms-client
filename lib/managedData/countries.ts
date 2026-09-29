import { ManagedDataSet } from ".";
import countriesData from "./data/countries.json";

export type Country = {
  flag: string;
  name_eng: string;
  name_fra: string;
  [key: string]: string | null;
};

export const countryDataSet: ManagedDataSet<Country[]> = {
  values: countriesData,
  filters: {},
};

type ManagedDataChoice = {
  en: string;
  fr: string;
  id: string;
};

type ManagedData = {
  [key: string]: ManagedDataChoice[];
};

export const countries: ManagedData = {
  all: countriesData.map((country) => ({
    en: country.name_eng,
    fr: country.name_fra,
    ...country,
  })),
};
