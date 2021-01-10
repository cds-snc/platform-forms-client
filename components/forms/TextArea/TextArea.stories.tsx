import React from 'react'
import { TextArea } from './TextArea'

export default {
  title: 'Forms/TextArea',
  component: TextArea,
  parameters: {
    info: `
USWDS 2.0 TextArea component

Source: https://designsystem.digital.gov/components/form-controls/#text-input
`,
  },
}

export const defaultTextArea = (): React.ReactElement => (
  <TextArea id="input-type-text" name="input-type-text" />
)

export const withDefaultValue = (): React.ReactElement => (
  <TextArea id="input-value" name="input-value" defaultValue="Change me" />
)

export const withPlaceholder = (): React.ReactElement => (
  <TextArea
    id="input-type-text"
    name="input-type-text"
    placeholder="Enter value"
  />
)

export const error = (): React.ReactElement => (
  <TextArea id="input-error" name="input-error" error />
)

export const success = (): React.ReactElement => (
  <TextArea id="input-success" name="input-success" success />
)

export const disabled = (): React.ReactElement => (
  <TextArea id="input-disabled" name="input-disabled" disabled />
)

export const readonly = (): React.ReactElement => (
  <TextArea id="input-readonly" name="input-readonly" readOnly />
)
