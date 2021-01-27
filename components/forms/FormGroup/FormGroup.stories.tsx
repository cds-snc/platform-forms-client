import React from "react";
import { FormGroup } from "./FormGroup";

import { Label } from "../Label/Label";
import { TextInput } from "../TextInput/TextInput";
import { ErrorMessage } from "../ErrorMessage/ErrorMessage";

export default {
  title: "Forms/FormGroup",
  component: FormGroup,
};

export const textInputFormGroup = (): React.ReactElement => (
  <FormGroup name="formGroup">
    <Label htmlFor="input-type-text">Text input label</Label>
    <TextInput id="input-type-text" name="input-type-text" type="text" />
  </FormGroup>
);

export const textInputErrorFormGroup = (): React.ReactElement => (
  <FormGroup name="formGroupError" error>
    <Label htmlFor="input-type-text" error>
      Text input label
    </Label>
    <ErrorMessage>Helpful error message</ErrorMessage>
    <TextInput
      id="input-type-text"
      name="input-type-text"
      type="text"
      validationStatus="error"
    />
  </FormGroup>
);
