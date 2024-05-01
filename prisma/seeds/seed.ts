/* eslint-disable no-console */
import { Prisma, PrismaClient } from "@prisma/client";
import seedTemplates from "./fixtures/templates";
import seedPrivileges from "./fixtures/privileges";
import seedSettings from "./fixtures/settings";
import seedUsers, { UserWithoutSecurityAnswers } from "./fixtures/users";
import seedSecurityQuestions from "./fixtures/security-questions";

type AnyObject = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

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

      const securityAttribute = formProperties.form.securityAttribute ?? "Protected A";

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

async function lowercaseEmailAddressMigration() {
  const users = (await prisma.user.findMany({
    select: {
      id: true,
      email: true,
    },
  })) as {
    id: string;
    email: string;
  }[];

  const usersToMigrate = users
    .filter((user) => /[A-Z]/.test(user.email))
    .map((user) => {
      return prisma.user
        .update({
          where: {
            id: user.id,
          },
          data: {
            email: user.email.toLowerCase(),
          },
        })
        .then(() =>
          console.log(`Converted email address ${user.email} to ${user.email.toLowerCase()}.`)
        )
        .catch((e: Error) =>
          console.log(
            `Failed to migrate user email address ${user.email} because of following error: ${e.message}`
          )
        );
    });

  await Promise.all(usersToMigrate);

  console.log(
    `${usersToMigrate.length} users required migration to lowercase email address but some may have failed (see logs above)`
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

    console.log("Running 'publishingStatus' migration");
    await publishingStatusMigration();

    console.log("Running 'templateSchema' migration");
    await templateSchemaMigration();

    console.log("Running 'lowercaseEmailAddress' migration");
    await lowercaseEmailAddressMigration();
  } catch (e) {
    console.error(e);
  } finally {
    prisma.$disconnect;
  }
}

export default main;
