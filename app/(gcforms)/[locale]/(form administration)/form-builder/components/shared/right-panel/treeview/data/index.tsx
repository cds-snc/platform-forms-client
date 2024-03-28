import { v4 as uuid } from "uuid";
import { TreeItem } from "../types";

export const start = {
  id: "start",
  name: "Start",
  readOnly: true,
  children: [
    {
      id: "introduction",
      name: "Introduction",
      readOnly: true,
    },
  ],
};

export const createItem = (name: string): TreeItem => {
  return {
    id: uuid(),
    name,
    readOnly: false,
    children: [{ id: uuid(), name: "New Section!!", readOnly: false }],
  };
};

export const end = {
  id: "end",
  name: "End",
  readOnly: true,
  children: [
    {
      id: "confirmation",
      name: "Confirmation",
      readOnly: true,
    },
  ],
};
