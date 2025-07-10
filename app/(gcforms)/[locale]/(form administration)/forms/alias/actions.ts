"use server";

import { prisma } from "@lib/integration/prismaConnector";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { AuthenticatedAction } from "@lib/actions";

export const createAlias = AuthenticatedAction(async (_, formData: FormData) => {
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
    return { message: "created" };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return { error: "aliasExists" };
      }
    }
    return { error: "failed" };
  }
});

export const updateAlias = AuthenticatedAction(async (_, id: string, formData: FormData) => {
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
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return { error: "aliasExists" };
      }
    }
    return { error: "failed" };
  }
});

export const deleteAlias = AuthenticatedAction(async (_, id: string) => {
  try {
    await prisma.formAlias.delete({
      where: {
        id,
      },
    });
    revalidatePath("/[locale]/forms/alias", "page");
    return { message: "deleted" };
  } catch (e) {
    return { error: "failed" };
  }
});
