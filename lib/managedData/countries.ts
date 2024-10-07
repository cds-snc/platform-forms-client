import { ManagedDataSet } from ".";
import countriesData from "./data/countries.json";

export type Country = {
  flag: string;
  name_eng: string;
  name_fra: string;
  [key: string]: string | null;
};

export const countries: ManagedDataSet<Country[]> = {
  values: countriesData,
  filters: {},
};
