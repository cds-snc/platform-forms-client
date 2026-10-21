/* eslint-disable no-console */
import { prisma, Prisma } from ".";
import seedTemplates from "./fixtures/templates";
import seedPrivileges from "./fixtures/privileges";
import seedSettings from "./fixtures/settings";
import seedUsers, { UserWithoutSecurityAnswers } from "./fixtures/users";
import seedSecurityQuestions from "./fixtures/security-questions";
import { parseArgs } from "node:util";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("Database Connection URL missing");
}

const developerEmail = process.env.DEVELOPER_EMAIL;
const developerName = process.env.DEVELOPER_NAME;

async function createTemplates(env: string) {
  // see https://github.com/prisma/prisma/issues/9247#issuecomment-1249322729 for why this check is needed
  const templatePromises = seedTemplates[env].map((formConfig, index) =>
    prisma.template.upsert({
      where: {
        id: `${index + 1}`,
      },
      update: {},
      create: {
        id: `${index + 1}`,
        name: formConfig.titleEn?.toString() ?? "",
        jsonConfig: formConfig !== null ? (formConfig as Prisma.JsonObject) : Prisma.JsonNull,
      },
    })
  );

  return Promise.all(templatePromises);
}

async function createPrivileges(env: string) {
  const typeSafePrivilegeData = seedPrivileges[env].map((privilege) => ({
    ...privilege,
    permissions: privilege.permissions !== null ? privilege.permissions : Prisma.JsonNull,
  }));

  const privilegePromises = typeSafePrivilegeData.map((privilege) => {
    return prisma.privilege.upsert({
      where: {
        name: privilege.name,
      },
      update: {
        permissions: privilege.permissions,
        descriptionEn: privilege.descriptionEn,
        descriptionFr: privilege.descriptionFr,
        priority: privilege.priority,
      },
      create: {
        name: privilege.name,
        permissions: privilege.permissions,
        descriptionEn: privilege.descriptionEn,
        descriptionFr: privilege.descriptionFr,
        priority: privilege.priority,
      },
    });
  });

  await Promise.all(privilegePromises);
}

/**
 * Fixtures in settings.ts are canonical, so we sync all properties except
 * value which is runtime-specific and should not be overwritten.
 *
 * If a setting is removed from the fixture, it will be deleted from the database as well.
 * If a setting is added to the fixture, it will be created in the database including the default value.
 *
 * @param env The environment for which to synchronize settings
 * @returns A promise that resolves when the settings have been synchronized
 */
async function syncSettings(env: string) {
  const settings = seedSettings[env];
  if (settings.length === 0) {
    throw new Error("Refusing to synchronize settings from an empty fixture");
  }

  await Promise.all(
    settings.map((setting) =>
      prisma.setting.upsert({
        where: { internalId: setting.internalId },
        // Fixture-owned metadata stays in sync across environments. Deliberately omit `value`
        // here: it is runtime configuration and must not be reset on deploy/seed.
        update: {
          nameEn: setting.nameEn,
          nameFr: setting.nameFr,
          descriptionEn: setting.descriptionEn,
          descriptionFr: setting.descriptionFr,
          type: setting.type,
          groupEn: setting.groupEn,
          groupFr: setting.groupFr,
        },
        create: setting,
      })
    )
  );

  // The fixture is authoritative. Settings removed from it are retired here; their callers
  // should be removed from the application in the same change.
  return prisma.setting.deleteMany({
    where: {
      internalId: { notIn: settings.map(({ internalId }) => internalId) },
    },
  });
}

async function createUsers(environment: string) {
  await prisma.user.upsert({
    where: {
      email: UserWithoutSecurityAnswers.email,
    },
    update: {},
    create: {
      ...UserWithoutSecurityAnswers,
    },
  });

  const [q1, q2, q3] = await prisma.securityQuestion.findMany();

  const users = seedUsers[environment].map((user) => {
    return prisma.user.upsert({
      where: {
        email: user.email,
      },
      update: {},
      create: {
        ...user,
        securityAnswers: {
          create: [
            {
              question: {
                connect: {
                  id: q1.id,
                },
              },
              answer: "example-answer",
            },
            {
              question: {
                connect: {
                  id: q2.id,
                },
              },
              answer: "example-answer",
            },
            {
              question: {
                connect: {
                  id: q3.id,
                },
              },
              answer: "example-answer",
            },
          ],
        },
      },
    });
  });
  await Promise.all(users);
}

async function createSecurityQuestions() {
  return prisma.securityQuestion.createMany({
    data: seedSecurityQuestions.map((question) => {
      return { questionEn: question.en, questionFr: question.fr };
    }),
    skipDuplicates: true,
  });
}

async function main() {
  const {
    values: { environment = "development" },
  } = parseArgs({
    options: { environment: { type: "string" } },
  });
  try {
    console.log(`Seeding Database for ${environment} enviroment`);
    await Promise.all([
      createTemplates(environment),
      createPrivileges(environment),
      syncSettings(environment),
      createSecurityQuestions(),
    ]);

    if (environment !== "production") {
      console.log(`Creating ${environment} Users`);
      await createUsers(environment);
    }

    if (environment === "development" && developerEmail && developerName) {
      // associate templates to developer
      console.log("Adding existing templates to developer account");
      const templates = await prisma.template.findMany();
      await prisma.user.update({
        where: {
          email: developerEmail,
        },
        data: {
          templates: {
            connect: templates.map((form) => ({ id: form.id })),
          },
        },
      });
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    prisma.$disconnect;
  }
}

main();
