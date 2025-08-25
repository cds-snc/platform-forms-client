"use server";
import { checkAll } from "../cache/flags";

export const getFlags = async () => {
  return checkAll();
};
