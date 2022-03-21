import React from "react";
import { FormGroup } from "./FormGroup";
import { Formik } from "formik";
import { Label } from "../Label/Label";
import { TextInput } from "../TextInput/TextInput";
import { ErrorMessage } from "../ErrorMessage/ErrorMessage";
import { logMessage } from "@lib/logger";

export default {
  title: "Forms/FormGroup",
  component: FormGroup,
};

export const textInputFormGroup = (): React.ReactElement => (
  <Formik
    onSubmit={(values) => {
      logMessage.log(values);
    }}
    initialValues={{ "input-type-text": "" }}
  >
    <FormGroup name="formGroup">
      <Label htmlFor="input-type-text">Text input label</Label>
      <TextInput
        id="input-type-text"
        name="input-type-text"
        type="text"
        characterCountMessages={{
          part1: "You have",
          part2: "characters left.",
          part1Error: "You have",
          part2Error: "characters too many.",
        }}
      />
    </FormGroup>
  </Formik>
);

export const textInputErrorFormGroup = (): React.ReactElement => (
  <Formik
    onSubmit={(values) => {
      logMessage.log(values);
    }}
    initialValues={{ "input-type-text": "" }}
  >
    <FormGroup name="formGroupError" error>
      <Label htmlFor="input-type-text" error>
        Text input label
      </Label>
      <ErrorMessage>Helpful error message</ErrorMessage>
      <TextInput
        id="input-type-text"
        name="input-type-text"
        type="text"
        characterCountMessages={{
          part1: "You have",
          part2: "characters left.",
          part1Error: "You have",
          part2Error: "characters too many.",
        }}
      />
    </FormGroup>
  </Formik>
);
