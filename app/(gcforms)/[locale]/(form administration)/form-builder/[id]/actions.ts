"use server";
import { checkOne } from "@lib/cache/flags";

export async function checkFlag(id: string) {
  return checkOne(id);
}
