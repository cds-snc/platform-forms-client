"use server";

import { prisma } from "@lib/integration/prismaConnector";
import { revalidatePath } from "next/cache";

export async function createAlias(formData: FormData) {
  try {
    const alias = formData.get("alias") as string;
    const formId = formData.get("formId") as string;

    await prisma.formAlias.create({
      data: {
        alias,
        formId,
      },
    });
    revalidatePath("/[locale]/forms/alias", "page");
    return { message: "Alias created" };
  } catch (e) {
    return { error: "Could not create alias" };
  }
}

export async function updateAlias(id: string, formData: FormData) {
  try {
    const alias = formData.get("alias") as string;
    const formId = formData.get("formId") as string;

    await prisma.formAlias.update({
      where: { id },
      data: {
        alias,
        formId,
      },
    });
    revalidatePath("/[locale]/forms/alias", "page");
    return { message: "Alias updated" };
  } catch (e) {
    return { error: "Could not update alias" };
  }
}

export async function deleteAlias(id: string) {
  try {
    await prisma.formAlias.delete({
      where: {
        id,
      },
    });
    revalidatePath("/[locale]/forms/alias", "page");
    return { message: "Alias deleted" };
  } catch (e) {
    return { error: "Could not delete alias" };
  }
}
