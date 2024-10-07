"use client";
import { InputFieldProps } from "@lib/types";

// AutoComplete API returns 1 or more objects like:
export interface AddressCompleteChoice {
  Id: string;
  Text: string;
  Highlight: string;
  Description: string;
  IsRetrievable: boolean;
}

// Address Lookup API returns an array of objects like:
export interface AddressCompleteResult {
  FieldGroup: string;
  FieldName: string;
  FormattedValue: string;
  FieldType: string;
  FieldSequence: number;
}

// Props for the AddressComplete component
export interface AddressCompleteProps extends InputFieldProps {
  canadianOnly?: boolean;
  splitAddress?: boolean;
}

// Address Elements for the AddressComplete component
export interface AddressElements {
  unitNumber: string;
  civicNumber: string;
  streetName: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}
