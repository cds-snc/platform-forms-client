import { FormElement, FormElementTypes } from "@lib/types";
import { ReactElement } from "react";

export interface ComponentPlugin {
  meta: { type: FormElementTypes };
  render(args: { element: FormElement; lang: string }): ReactElement | null;
}
