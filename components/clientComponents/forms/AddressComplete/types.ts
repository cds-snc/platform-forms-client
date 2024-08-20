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

export interface AddressCompleteProps extends InputFieldProps {
  showCity?: boolean;
  showProvince?: boolean;
  showPostal?: boolean;
  showCountry?: boolean;
}
