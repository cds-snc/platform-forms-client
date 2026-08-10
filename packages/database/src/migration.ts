/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
import { prisma, Prisma } from ".";
import readline from "node:readline";

async function main(): Promise<void> {
  try {
    const menuSelection = await requestUserInput(`
(1) How many PUBLISHED templates require migration?
(2) How many UNPUBLISHED templates require migration?
(3) Run migration on PUBLISHED templates
`);

    switch (menuSelection) {
      case "1": {
        await findNumberOfTemplatesThatRequireMigration(true);
        break;
      }
      case "2": {
        await findNumberOfTemplatesThatRequireMigration(false);
        break;
      }
      case "3": {
        await runMigrationOnPublishedForms();
        break;
      }
      default: {
        break;
      }
    }
  } catch (error) {
    console.log("Oops! Something went wrong. See error below:");
    console.log(error);
  }
}

async function findNumberOfTemplatesThatRequireMigration(isPublished: boolean): Promise<void> {
  const templates = await prisma.template.findMany({
    where: {
      isPublished: isPublished,
      versions: {
        none: {},
      },
    },
    select: {
      id: true,
    },
  });

  console.log(
    `Number of ${isPublished ? "published" : "unpublished"} templates to migrate: ${JSON.stringify(templates.length)}`
  );
}

async function runMigrationOnPublishedForms(): Promise<void> {
  const choice = await requestUserInput(`Are you sure? (yes/no): `);

  if (choice !== "yes") return;

  let numberOfUpdatedTemplates = 0;

  while (true) {
    const templates = await prisma.template.findMany({
      where: {
        isPublished: true,
        versions: {
          none: {},
        },
      },
      select: {
        id: true,
        jsonConfig: true,
        created_at: true,
        updated_at: true,
        lastEditedByUserId: true,
      },
      take: 10,
    });

    if (templates.length === 0) break;

    for (const template of templates) {
      await prisma.$transaction(async (tx) => {
        const newVersion = await tx.templateVersion.create({
          data: {
            templateId: template.id,
            versionNumber: 1,
            status: "PUBLISHED",
            jsonConfig: template.jsonConfig as Prisma.JsonObject,
            createdAt: template.created_at,
            updatedAt: template.updated_at,
            publishedAt: template.updated_at,
            publishReason: "N/A",
            createdByUserId: template.lastEditedByUserId,
            publishedByUserId: template.lastEditedByUserId,
          },
        });

        await tx.template.update({
          where: {
            id: template.id,
          },
          data: {
            currentPublishedVersionId: newVersion.id,
          },
        });
      });

      numberOfUpdatedTemplates++;

      console.log(`Template ${template.id} has been updated`);
    }
  }

  console.log(`Migration is complete! ${numberOfUpdatedTemplates} templates have been migrated.`);
}

function requestUserInput(question: string): Promise<string> {
  const readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<string>((resolve) =>
    readlineInterface.question(question, (response) => {
      readlineInterface.close();
      resolve(response);
    })
  );
}

main();
