import React, { useEffect } from "react";
import { useField } from "formik";
import classNames from "classnames";
import { ErrorMessage } from "../index";
import IntlTelInput from "react-int-phone-input-accessibility";
// must import this here otherwise error occurs
import "react-int-phone-input-accessibility/dist/main.css";

interface RequiredPhoneInputProps {
  id: string;
  name: string;
}

interface CustomPhoneInputProps {
  required?: boolean;
  className?: string;
  ariaDescribedBy?: string;
  placeholder?: string;
}

export type OptionalPhoneInputProps = CustomPhoneInputProps & JSX.IntrinsicElements["input"];

export type PhoneInputProps = RequiredPhoneInputProps & OptionalPhoneInputProps;

export const PhoneInput = (props: PhoneInputProps): React.ReactElement => {
  const { id, className, required, ariaDescribedBy, placeholder } = props;
  const [field, meta, helpers] = useField(props);
  const { value } = field;
  const { setValue } = helpers;
  const classes = classNames("gc-input-text", className);
  const extraInputProps = {
    id: id,
    required: required,
    "aria-describedby": ariaDescribedBy,
    ...field,
  };

  const _onChange = (isValid: boolean, newNumber: string) => {
    setValue(newNumber.replace(/\(|\)|\s|-/g, ""));
  };

  // used to add aria-labelledby and aria-describedby to country code selector to make it accessible
  useEffect(() => {
    const buttonDropDown = document.getElementsByClassName("selected-flag");
    if (buttonDropDown.length > 0) {
      buttonDropDown[0].setAttribute("aria-labelledby", `label-${id}`);
      ariaDescribedBy ? buttonDropDown[0].setAttribute("aria-describedby", ariaDescribedBy) : false;
    }
  });

  return (
    <>
      {meta.touched && meta.error ? <ErrorMessage>{meta.error}</ErrorMessage> : null}
      <IntlTelInput
        containerClassName={"intl-tel-input mb-14"}
        inputClassName={classes}
        fieldId={extraInputProps.id}
        value={value.replace("+1", "")}
        placeholder={placeholder}
        fieldName={extraInputProps.name}
        telInputProps={extraInputProps}
        onPhoneNumberChange={_onChange}
        defaultCountry={"ca"}
        preferredCountries={["ca"]}
        useMobileFullscreenDropdown
        nationalMode={false}
        autoHideDialCode={false}
      />
    </>
  );
};

export default PhoneInput;
