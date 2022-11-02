/* eslint-disable no-console */
import { Prisma, PrismaClient } from "@prisma/client";
import { parse } from "ts-command-line-args";
import seedTemplates from "./fixtures/templates";
import seedPrivileges from "./fixtures/privileges";

const prisma = new PrismaClient();

async function createTemplates(env: string) {
  // see https://github.com/prisma/prisma/issues/9247#issuecomment-1249322729 for why this check is needed
  const typeSafeTemplateData = seedTemplates[env].map((template) => ({
    jsonConfig:
      template.jsonConfig !== null ? (template.jsonConfig as Prisma.JsonObject) : Prisma.JsonNull,
  }));

  return prisma.template.createMany({
    data: [...typeSafeTemplateData],
  });
}

async function createPrivileges(env: string) {
  const typeSafePrivilegeData = seedPrivileges[env].map((privilege) => ({
    ...privilege,
    permissions: privilege.permissions !== null ? privilege.permissions : Prisma.JsonNull,
  }));
  return prisma.privilege.createMany({
    data: typeSafePrivilegeData,
    skipDuplicates: true,
  });
}

async function main() {
  const { environment = "production" } = parse<{ environment?: string }>({
    environment: { type: String, optional: true },
  });
  console.log(`Seeding Database for ${environment} enviroment`);
  await Promise.all([createTemplates(environment), createPrivileges(environment)]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
