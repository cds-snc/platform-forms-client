import { prisma } from "@gcforms/database";
import { logMessage } from "@lib/logger";

export default async function teardown() {
  try {
    const tablenames = await prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter((name) => name !== "_prisma_migrations")
      .map((name) => `"public"."${name}"`)
      .join(", ");

    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    logMessage.error(`Error tearing down database: ${error}`);
  } finally {
    prisma.$disconnect();
  }
}
