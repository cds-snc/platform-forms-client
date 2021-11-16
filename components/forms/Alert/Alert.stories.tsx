import React from "react";
import { Alert } from "./Alert";

import { Button } from "../Button/Button";
import ErrorListItem from "../Form/ErrorListItem";

export default {
  title: "Forms/Alert",
  component: Alert,
};

const testText = (
  <>
    Lorem ipsum dolor sit amet, <a href="#test">consectetur adipiscing</a> elit, sed do eiusmod.
  </>
);

export const success = (): React.ReactElement => (
  <Alert type="success" heading="Success status">
    {testText}
  </Alert>
);

export const warning = (): React.ReactElement => (
  <Alert type="warning" heading="Warning status">
    {testText}
  </Alert>
);

export const error = (): React.ReactElement => (
  <Alert type="error" heading="Error status">
    {testText}
  </Alert>
);

export const info = (): React.ReactElement => (
  <Alert type="info" heading="Informative status">
    {testText}
  </Alert>
);

export const slim = (): React.ReactElement => (
  <>
    <Alert type="success" slim>
      {testText}
    </Alert>
    <Alert type="warning" slim>
      {testText}
    </Alert>
    <Alert type="error" slim>
      {testText}
    </Alert>
    <Alert type="info" slim>
      {testText}
    </Alert>
  </>
);

export const noIcon = (): React.ReactElement => (
  <>
    <Alert type="success" noIcon>
      {testText}
    </Alert>
    <Alert type="warning" noIcon>
      {testText}
    </Alert>
    <Alert type="error" noIcon>
      {testText}
    </Alert>
    <Alert type="info" noIcon>
      {testText}
    </Alert>
  </>
);

export const slimNoIcon = (): React.ReactElement => (
  <>
    <Alert type="success" slim noIcon>
      {testText}
    </Alert>
    <Alert type="warning" slim noIcon>
      {testText}
    </Alert>
    <Alert type="error" slim noIcon>
      {testText}
    </Alert>
    <Alert type="info" slim noIcon>
      {testText}
    </Alert>
  </>
);

export const withCTA = (): React.ReactElement => (
  <Alert type="warning" heading="Warning status" cta={<Button type="button">Click here</Button>}>
    {testText}
  </Alert>
);

export const formValidationErrorList = (): React.ReactElement => (
  <Alert
    type="error"
    heading="Please correct the errors on the page"
    validation={true}
    id="1234"
    tabIndex={0}
  >
    <ol className="gc-ordered-list">
      <ErrorListItem errorKey="1.0" value="First error message." />
      <ErrorListItem errorKey="2.0" value="Second error message." />
    </ol>
  </Alert>
);
