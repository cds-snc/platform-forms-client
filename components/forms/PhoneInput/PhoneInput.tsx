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
}

interface CountryData {
  name: string;
  dialCode: string;
  countryCode: string;
}

export type PhoneInputProps = OptionalPhoneInputProps &
  RequiredTextInputProps &
  JSX.IntrinsicElements["input"];

export const CustomPhoneInput = (props: PhoneInputProps): React.ReactElement => {
  const {
    id,
    className,
    required,
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
  };

  const _onChange = (
    value: string,
    country: Record<string, unknown>,
    e: React.ChangeEvent<HTMLInputElement>,
    formattedValue: string
  ) => {
    setValue(formattedValue);
  };
/* eslint-disable */ 
  const _onblur = (e: React.FocusEvent<HTMLInputElement>, data: CountryData) => {
    setValue(formatInputPhoneValue(e.target.value));
  };
  /* eslint-enable */

  const formatInputPhoneValue = (phoneNumber: string): string | null => {
    return `+${phoneNumber.replace(/[^0-9\\.]+/g, "")}`;
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
          inputClass={classNames("gc-input-phone")}
          buttonClass={classNames("gc-input-phone-button-style")}
          country={country ? country : "ca"}
          placeholder={placeholder}
          countryCodeEditable={false}
          value={value}
          onlyCountries={onlyCountries}
          preferredCountries={preferredCountries}
          onChange={_onChange}
          onBlur={_onblur}
        />
      </div>
    </>
  );
};

export default CustomPhoneInput;
