import React from "react";
import { useField } from "formik";
import classNames from "classnames";
import { ErrorMessage } from "../index";
import PhoneInput from "react-phone-input-2";

interface OptionalPhoneInputProps {
  error?: boolean;
  required?: boolean;
  className?: string;
  ariaDescribedBy?: string;
  placeholder?: string;
  country?: string;
  onlyCountries?: Array<string>;
  preferredCountries?: Array<string>;
  key?: string;
}

interface RequiredTextInputProps {
  id: string;
  name: string;
  type: string;
}

export type PhoneInputProps = OptionalPhoneInputProps &
  RequiredTextInputProps &
  JSX.IntrinsicElements["input"];

export const CustomPhoneInput = (props: PhoneInputProps): React.ReactElement => {
  const {
    id,
    type,
    className,
    required,
    ariaDescribedBy,
    placeholder,
    name,
    country,
    key,
    onlyCountries,
    preferredCountries,
  } = props;
  const [field, meta, helpers] = useField(props);
  const { value } = meta;
  const { setValue } = helpers;
  const classes = classNames("gc-input-text", className);
  const extraInputProps = {
    name: name,
    id: id,
    key: key,
    required: required,
    type: type,
  };
  const style = {
    border: "none",
  };
  const _onChange = (
    value: string,
    country: Record<string, unknown>,
    e: React.ChangeEvent<HTMLInputElement>,
    formattedValue: string
  ) => {
    setValue(formatInputPhoneValue(formattedValue, true));
  };

  const formatInputPhoneValue = (phoneNumber: string, useFormat = false): string | null => {
    const match = phoneNumber.match(/\+?(\d)?[-. ]?(\(?\d{3}\)?)[-. ]?(\d{3})[-. ]?(\d{4})/);
    if (useFormat && match) {
      const intlCode = match[1] ? "1 " : "";
      return [intlCode, "", match[2], "-", match[3], "-", match[4]]
        .join("")
        .replace(/\(|\)/gi, () => {
          return "";
        });
    }
    return phoneNumber;
  };

  return (
    <>
      {meta.touched && meta.error ? <ErrorMessage>{meta.error}</ErrorMessage> : null}
      <div>
        <PhoneInput
          data-testid="textInput"
          {...field}
          inputProps={{ ...extraInputProps }}
          containerClass={classes}
          inputStyle={style}
          dropdownStyle={style}
          buttonStyle={style}
          country={country ? country : "ca"}
          placeholder={placeholder}
          countryCodeEditable={false}
          value={value}
          onlyCountries={onlyCountries}
          preferredCountries={preferredCountries}
          onChange={_onChange}
          aria-describedby={ariaDescribedBy}
        />
      </div>
    </>
  );
};

export default CustomPhoneInput;
