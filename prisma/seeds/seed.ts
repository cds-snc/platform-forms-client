/* eslint-disable no-console */
import { Prisma, PrismaClient } from "@prisma/client";
import { parse } from "ts-command-line-args";
import seedTemplates from "./fixtures/templates";
import seedPrivileges from "./fixtures/privileges";

type AnyObject = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

const prisma = new PrismaClient();

async function createTemplates(env: string) {
  // see https://github.com/prisma/prisma/issues/9247#issuecomment-1249322729 for why this check is needed
  const typeSafeTemplateData = seedTemplates[env].map((formConfig) => ({
    jsonConfig: formConfig !== null ? (formConfig as Prisma.JsonObject) : Prisma.JsonNull,
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

async function templateSchemaMigration() {
  const templates = await prisma.template.findMany({
    select: {
      id: true,
      jsonConfig: true,
    },
  });

  const templatesToMigrate = templates
    .filter((template) => (template.jsonConfig as Record<string, unknown>).submission !== undefined)
    .map((template) => {
      const formProperties = template.jsonConfig as AnyObject;

      const newJsonConfiguration = {
        titleEn: formProperties.form.titleEn ?? "",
        titleFr: formProperties.form.titleFr ?? "",
        introduction: {
          descriptionEn: formProperties.form.introduction?.descriptionEn ?? "",
          descriptionFr: formProperties.form.introduction?.descriptionFr ?? "",
        },
        privacyPolicy: {
          descriptionEn: formProperties.form.privacyPolicy?.descriptionEn ?? "",
          descriptionFr: formProperties.form.privacyPolicy?.descriptionFr ?? "",
        },
        confirmation: {
          descriptionEn: formProperties.form.endPage?.descriptionEn ?? "",
          descriptionFr: formProperties.form.endPage?.descriptionFr ?? "",
          referrerUrlEn: formProperties.form.endPage?.referrerUrlEn ?? "",
          referrerUrlFr: formProperties.form.endPage?.referrerUrlFr ?? "",
        },
        layout: formProperties.form.layout,
        elements: formProperties.form.elements,
      };

      const name = formProperties.internalTitleEn ?? "";

      const findDeliveryOption = () => {
        if (formProperties.submission.email && formProperties.submission.email !== "") {
          return {
            emailAddress: formProperties.submission.email,
            emailSubjectEn: formProperties.form.emailSubjectEn,
            emailSubjectFr: formProperties.form.emailSubjectFr,
          };
        }
        return null;
      };

      const deliveryOption = findDeliveryOption();

      const securityAttribute = formProperties.form.securityAttribute ?? "Unclassified";

      return prisma.template.update({
        where: {
          id: template.id,
        },
        data: {
          name: name,
          jsonConfig: newJsonConfiguration as Prisma.JsonObject,
          ...(deliveryOption && {
            deliveryOption: {
              create: {
                emailAddress: deliveryOption.emailAddress as string,
                emailSubjectEn: deliveryOption.emailSubjectEn as string,
                emailSubjectFr: deliveryOption.emailSubjectFr as string,
              },
            },
          }),
          securityAttribute: securityAttribute as string,
        },
      });
    });

  await Promise.all(templatesToMigrate);

  console.log(`${templatesToMigrate.length} were migrated for new Template schema`);
}

async function main() {
  const { environment = "production" } = parse<{ environment?: string }>({
    environment: { type: String, optional: true },
  });

  console.log(`Seeding Database for ${environment} enviroment`);
  await Promise.all([createTemplates(environment), createPrivileges(environment)]);

  console.log("Running 'publishingStatus' migration");
  await publishingStatusMigration();

  console.log("Running 'templateSchema' migration");
  await templateSchemaMigration();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
