/* eslint-disable no-console */
import { Prisma, PrismaClient } from "@prisma/client";
import seedTemplates from "./fixtures/templates";
import seedPrivileges from "./fixtures/privileges";
import seedSettings from "./fixtures/settings";
import seedUsers, { UserWithoutSecurityAnswers } from "./fixtures/users";
import seedSecurityQuestions from "./fixtures/security-questions";

const prisma = new PrismaClient();

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

async function createSettings(env: string) {
  return prisma.setting.createMany({
    data: seedSettings[env],
    skipDuplicates: true,
  });
}

async function createUsers() {
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

  const users = seedUsers["test"].map((user) => {
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

// Can be removed once we know that the migration is completed
async function deliveryOptionMigration() {
  const deliveryOptions = await prisma.deliveryOption.deleteMany({
    where: {
      template: {
        isPublished: false, // Only remove the delivery option for draft templates
      },
    },
  });

  console.log(
    `${deliveryOptions.count} were migrated for move email Delivery Option to Vault migration`
  );
}

// Part 1: Notifications v2 data migration - run once and then remove after data migration is complete
async function emailNotificationsUsersMigration() {
  const templates = await prisma.template.findMany({
    where: { notificationsInterval: { not: null } },
    select: {
      id: true,
      users: { select: { id: true } },
    },
  });

  await Promise.all(
    templates.map((template) =>
      prisma.template.update({
        where: { id: template.id },
        data: {
          notificationsUsers: {
            connect: template.users.map((u) => ({ id: u.id })),
          },
        },
      })
    )
  );

  console.log(
    `${templates.length} were migrated for update email notifications users that have a non null notificationsInterval`
  );
}

async function main(environment: string) {
  try {
    console.log(`Seeding Database for ${environment} enviroment`);
    await Promise.all([
      createTemplates(environment),
      createPrivileges(environment),
      createSettings(environment),
      createSecurityQuestions(),
    ]);

    if (environment !== "production") {
      console.log("Creating test Users");
      try {
        await createUsers();
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          // The .code property can be accessed in a type-safe manner
          if (e.code === "P2002") {
            console.log(
              "There is a unique constraint violation, a new user cannot be created with this email"
            ); // just log it and keep going
          } else throw e;
        }
      }
    }

    console.log("Running 'deliveryOptionMigration' migration");
    await deliveryOptionMigration();

    // Part 1:
    console.log("Running 'emailNotificationsUsersMigration' migration");
    await emailNotificationsUsersMigration();
  } catch (e) {
    console.error(e);
  } finally {
    prisma.$disconnect;
  }
}

export default main;
