/* eslint-disable no-console */
import { Prisma, PrismaClient } from "@prisma/client";
import { parse } from "ts-command-line-args";
import seedTemplates from "./fixtures/templates";
import seedPrivileges from "./fixtures/privileges";

const prisma = new PrismaClient();

async function createTemplates(env: string) {
  const templatesToCreate = seedTemplates[env].map((formConfig) => {
    return prisma.template.create({
      data: {
        jsonConfig: formConfig,
        deliveryOption: {
          create: {
            emailAddress: "",
            emailSubjectEn: "",
            emailSubjectFr: "",
          },
        },
      },
    });
  });

  await Promise.all(templatesToCreate);

  console.log(`Created ${seedTemplates[env].length} templates`);
}

async function createPrivileges(env: string) {
  const typeSafePrivilegeData = seedPrivileges[env].map((privilege) => ({
    ...privilege,
    permissions: privilege.permissions !== null ? privilege.permissions : Prisma.JsonNull,
  }));

  await prisma.privilege.createMany({
    data: typeSafePrivilegeData,
    skipDuplicates: true,
  });

  console.log(`Created ${seedPrivileges[env].length} privileges`);
}

//Can be removed once we know that the migration is completed
async function publishingStatusMigration() {
  const templates = await prisma.template.findMany({
    select: {
      id: true,
      jsonConfig: true,
    },
  });

  const templatesToMigrate = templates
    .filter((template) => {
      return (template.jsonConfig as Record<string, unknown>).publishingStatus !== undefined;
    })
    .map((template) => {
      const { publishingStatus, ...jsonConfigWithoutPublishingStatus } =
        template.jsonConfig as Record<string, unknown>;

      return prisma.template.update({
        where: {
          id: template.id,
        },
        data: {
          jsonConfig: jsonConfigWithoutPublishingStatus as Prisma.JsonObject,
          isPublished: publishingStatus as boolean,
        },
      });
    });

  await Promise.all(templatesToMigrate);

  console.log(`${templatesToMigrate.length} were migrated for Publishing Status`);
}

async function main() {
  const { environment = "production" } = parse<{ environment?: string }>({
    environment: { type: String, optional: true },
  });

  console.log(`Seeding Database for ${environment} enviroment`);
  await createTemplates(environment);
  await createPrivileges(environment);

  console.log("Running 'publishingStatus' migration");
  await publishingStatusMigration();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
