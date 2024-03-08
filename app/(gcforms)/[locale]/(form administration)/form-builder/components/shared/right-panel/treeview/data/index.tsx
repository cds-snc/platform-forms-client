import { v4 as uuid } from "uuid";
import { FormItem } from "../types";

export const start = {
  id: "start",
  name: "Start",
  icon: null,
  readOnly: true,
  children: [
    {
      id: "introduction",
      name: "Introduction",
      icon: null,
      readOnly: true,
    },
  ],
};

export const createItem = (name: string): FormItem => {
  return {
    id: uuid(),
    name,
    icon: null,
    readOnly: false,
    children: [],
  };
};

export const end = {
  id: "end",
  name: "End",
  icon: null,
  readOnly: true,
  children: [
    {
      id: "confirmation",
      icon: null,
      name: "Confirmation",
      readOnly: true,
    },
  ],
};
