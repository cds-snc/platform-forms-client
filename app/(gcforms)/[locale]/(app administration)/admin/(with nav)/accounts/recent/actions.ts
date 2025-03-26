"use server";
import { addNoteToUser } from "@lib/users";
import { revalidatePath } from "next/cache";

export const addNote = async (userID: string, note: string) => {
  await addNoteToUser(userID, note);
  revalidatePath(
    "(gcforms)/[locale]/(app administration)/admin/(with nav)/accounts/recent",
    "page"
  );
};
