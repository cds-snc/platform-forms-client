import React from "react"
import { ErrorMessage } from "./ErrorMessage"

export default {
  title: "Forms/ErrorMessage",
  component: ErrorMessage,
  parameters: {
    info: `ErrorMessage component`,
  },
}

export const defaultErrorMessage = (): React.ReactElement => (
  <ErrorMessage>Helpful error message</ErrorMessage>
)
