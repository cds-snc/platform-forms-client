/* eslint-disable no-console */
import type { PrismaClient } from "@prisma/client";
import seedTemplates from "../fixtures/templates";
import seedPrivileges from "../fixtures/privileges";
import seedSettings from "../fixtures/settings";
import seedUsers, { UserWithoutSecurityAnswers } from "../fixtures/users";
import seedSecurityQuestions from "../fixtures/security-questions";

async function createTemplates(env: string, prisma: PrismaClient) {
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
        jsonConfig: formConfig !== null ? formConfig : null,
      },
    })
  );

  return Promise.all(templatePromises);
}

async function createPrivileges(env: string, prisma: PrismaClient) {
  const typeSafePrivilegeData = seedPrivileges[env].map((privilege) => ({
    ...privilege,
    permissions: privilege.permissions !== null ? privilege.permissions : null,
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

async function createSettings(env: string, prisma: PrismaClient) {
  return prisma.setting.createMany({
    data: seedSettings[env],
    skipDuplicates: true,
  });
}

async function createUsers(prisma: PrismaClient) {
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

async function createSecurityQuestions(prisma: PrismaClient) {
  return prisma.securityQuestion.createMany({
    data: seedSecurityQuestions.map((question) => {
      return { questionEn: question.en, questionFr: question.fr };
    }),
    skipDuplicates: true,
  });
}

async function main(prisma: PrismaClient, environment: string) {
  try {
    console.log(`Seeding Database for ${environment} enviroment`);
    await Promise.all([
      createTemplates(environment, prisma),
      createPrivileges(environment, prisma),
      createSettings(environment, prisma),
      createSecurityQuestions(prisma),
    ]);

    if (environment !== "production") {
      console.log("Creating test Users");
      try {
        await createUsers(prisma);
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
  } catch (e) {
    console.error(e);
  } finally {
    prisma.$disconnect;
  }
}

export default main;
