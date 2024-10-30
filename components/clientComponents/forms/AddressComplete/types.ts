"use client";
import { InputFieldProps } from "@lib/types";

// AutoComplete API returns 1 or more objects like:
export interface AddressCompleteChoice {
  Id: string;
  Text: string;
  Highlight: string;
  Cursor: number;
  Description: string;
  Next: AddressCompleNext;
}

// AutoComplete API returns Find or Retreive as a "next" status.
export enum AddressCompleNext {
  Find = "Find",
  Retrieve = "Retrieve",
}

// Address Lookup API returns an array of objects like:
export interface AddressCompleteResult {
  Id: string;
  DomesticId: string;
  Language: string;
  LanguageAlternatives: string;
  Department: string;
  Company: string;
  SubBuilding: string;
  BuildingNumber: string;
  BuildingName: string;
  SecondaryStreet: string;
  Street: string;
  Block: string;
  Neighbourhood: string;
  District: string;
  City: string;
  Line1: string;
  Line2: string;
  Line3: string;
  Line4: string;
  Line5: string;
  AdminAreaName: string;
  AdminAreaCode: string;
  Province: string;
  ProvinceName: string;
  ProvinceCode: string;
  PostalCode: string;
  CountryName: string;
  CountryIso2: string;
  CountryIso3: string;
  CountryIsoNumber: number;
  SortingNumber1: string;
  SortingNumber2: string;
  Barcode: string;
  POBoxNumber: string;
  Label: string;
  DataLevel: string;
}

// Props for the AddressComplete component
export interface AddressCompleteProps extends InputFieldProps {
  canadianOnly?: boolean;
  splitAddress?: boolean;
}

// Address Elements for the AddressComplete component
export interface AddressElements {
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

// AddressComplete String Labels {
export interface AddressCompleteLabels {
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
  provinceOrState: string;
  postalCodeOrZip: string;
  country: string;
}
