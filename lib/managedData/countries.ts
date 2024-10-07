import { ManagedDataSet } from ".";
import { PropertyChoices } from "@lib/types";
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

type ManagedData = {
  [key: string]: PropertyChoices[];
};

export const countries: ManagedData = {
  all: countriesData.map((country) => ({
    en: country.name_eng,
    fr: country.name_fra,
    ...country,
  })),
};
