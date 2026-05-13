/* eslint-disable no-console */
import { parseArgs } from "node:util";
import { prisma } from "@gcforms/database";

const firstNames = [
  "Alex",
  "Amira",
  "Avery",
  "Cameron",
  "Charlie",
  "Devon",
  "Emerson",
  "Jordan",
  "Kai",
  "Logan",
  "Morgan",
  "Parker",
  "Quinn",
  "Riley",
  "Taylor",
];

const lastNames = [
  "Anderson",
  "Bouchard",
  "Chen",
  "Davies",
  "Gagnon",
  "Khan",
  "Lee",
  "Martin",
  "Nguyen",
  "Patel",
  "Roy",
  "Singh",
  "Smith",
  "Tremblay",
  "Wilson",
];

const pickFrom = (values: string[], index: number, offset = 0) => {
  return values[(index + offset) % values.length];
};

const buildName = (index: number) => {
  return `${pickFrom(firstNames, index)} ${pickFrom(lastNames, index, 3)}`;
};

const buildEmail = (prefix: string, domain: string, index: number) => {
  return `${prefix}.${index}@${domain}`.toLowerCase();
};

const chunk = <T>(values: T[], size: number) => {
  const chunks: T[][] = [];

  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }

  return chunks;
};

async function main() {
  const {
    values: { count = "2500", domain = "example.test", prefix = "local-account" },
  } = parseArgs({
    options: {
      count: { type: "string" },
      domain: { type: "string" },
      prefix: { type: "string" },
    },
  });

  const parsedCount = Number.parseInt(count, 10);

  if (Number.isNaN(parsedCount) || parsedCount < 1) {
    throw new Error("--count must be a positive integer");
  }

  const users = Array.from({ length: parsedCount }, (_, index) => ({
    name: buildName(index),
    email: buildEmail(prefix, domain, index + 1),
    active: index % 7 !== 0,
    createdAt: new Date(Date.now() - index * 60_000),
  }));

  console.log(`Creating up to ${parsedCount} local users with prefix '${prefix}' on ${domain}`);
  const results = await Promise.all(
    chunk(users, 500).map((userBatch) => {
      return prisma.user.createMany({
        data: userBatch,
        skipDuplicates: true,
      });
    })
  );

  const createdCount = results.reduce((total, result) => total + result.count, 0);

  console.log(`Created ${createdCount} users.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
