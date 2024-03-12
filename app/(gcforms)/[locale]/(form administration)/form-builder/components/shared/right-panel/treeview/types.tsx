import { ComponentType } from "react";
export type FormItem = {
  id: string;
  readOnly: boolean;
  name: string;
  icon?: ComponentType | null;
  children?: FormItem[];
};

export type TreeData = FormItem[];
