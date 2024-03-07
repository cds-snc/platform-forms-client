import { ComponentType } from "react";
export type FormItem = {
  id: string;
  name: string;
  icon: ComponentType | null;
  readOnly: boolean;
  children?: FormItem[];
};
