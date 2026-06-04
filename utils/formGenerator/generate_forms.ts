/* eslint-disable no-console */
import readline from "readline";
import { config } from "dotenv";
import pg from "pg";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

config();

const { Pool } = pg;

const FIXTURES_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../__fixtures__");

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<string>((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    })
  );
}

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

function startSpinner(total: number): (current: number, label: string) => void {
  let frame = 0;
  const interval = setInterval(() => {
    frame = (frame + 1) % SPINNER_FRAMES.length;
  }, 80);

  function update(current: number, label: string): void {
    const pct = Math.round((current / total) * 100);
    const bar = "█".repeat(Math.floor(pct / 5)) + "░".repeat(20 - Math.floor(pct / 5));
    readline.cursorTo(process.stdout, 0);
    readline.clearLine(process.stdout, 0);
    process.stdout.write(
      `  ${SPINNER_FRAMES[frame]} [${bar}] ${pct}% (${current}/${total}) ${label}`
    );
  }

  function stop(message: string): void {
    clearInterval(interval);
    readline.cursorTo(process.stdout, 0);
    readline.clearLine(process.stdout, 0);
    process.stdout.write(message + "\n");
  }

  (update as { stop?: typeof stop }).stop = stop;
  return update as typeof update & { stop: typeof stop };
}

function listFixtures(): string[] {
  return fs
    .readdirSync(FIXTURES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""));
}

async function pickFixture(): Promise<string> {
  const fixtures = listFixtures();

  console.info("\nAvailable fixture forms:");
  fixtures.forEach((name, index) => {
    console.info(`  [${index}] ${name}`);
  });

  const answer = await prompt(
    `\nSelect a fixture by number or type its name [default: cdsIntakeTestForm]: `
  );

  if (!answer) return "cdsIntakeTestForm";

  const asNumber = parseInt(answer, 10);
  if (!isNaN(asNumber) && asNumber >= 0 && asNumber < fixtures.length) {
    return fixtures[asNumber];
  }

  if (fixtures.includes(answer)) return answer;

  throw new Error(`Fixture "${answer}" not found.`);
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.info("=== GC Forms — Draft Form Generator ===\n");

    const fixtureName = await pickFixture();
    const fixturePath = path.join(FIXTURES_DIR, `${fixtureName}.json`);
    const formConfig = JSON.parse(fs.readFileSync(fixturePath, "utf-8"));

    const countStr = await prompt("Number of forms to create: ");
    const count = parseInt(countStr, 10);
    if (isNaN(count) || count < 1) {
      throw new Error("Please enter a valid number greater than 0.");
    }

    const publishedStr = await prompt(
      `Number of those forms to make published [default: 0, max: ${count}]: `
    );
    const publishedCount = publishedStr ? parseInt(publishedStr, 10) : 0;
    if (isNaN(publishedCount) || publishedCount < 0 || publishedCount > count) {
      throw new Error(`Published count must be between 0 and ${count}.`);
    }

    const archivedStr = await prompt(
      `Number of those forms to make archived [default: 0, max: ${count}]: `
    );
    const archivedCount = archivedStr ? parseInt(archivedStr, 10) : 0;
    if (isNaN(archivedCount) || archivedCount < 0 || archivedCount > count) {
      throw new Error(`Archived count must be between 0 and ${count}.`);
    }
    if (publishedCount + archivedCount > count) {
      throw new Error(
        `Published (${publishedCount}) and archived (${archivedCount}) counts cannot exceed total forms (${count}).`
      );
    }

    const userEmail = await prompt(
      "User email to associate with the forms [default: test.user@cds-snc.ca]: "
    );
    const email = userEmail || "test.user@cds-snc.ca";

    const userResult = await pool.query<{ id: string }>(
      `SELECT id FROM "User" WHERE email = $1 LIMIT 1`,
      [email]
    );
    if (userResult.rowCount === 0) {
      throw new Error(`No user found with email: ${email}`);
    }
    const userId = userResult.rows[0].id;

    console.info(`\nCreating ${count} form(s) from "${fixtureName}" for ${email}...\n`);

    const createdIds: string[] = [];
    const spinner = startSpinner(count) as ReturnType<typeof startSpinner> & {
      stop: (msg: string) => void;
    };

    // Forms 1..publishedCount are published.
    // Forms (count-archivedCount+1)..count are archived (ttl in the past).
    // This keeps published and archived groups non-overlapping.
    const pastTimestamp = new Date("2000-01-01T00:00:00Z").toISOString();

    for (let i = 1; i <= count; i++) {
      const titleSuffix = ` (${i})`;
      const patchedConfig = {
        ...formConfig,
        titleEn: `${formConfig.titleEn ?? "Form"}${titleSuffix}`,
        titleFr: `${formConfig.titleFr ?? "Formulaire"}${titleSuffix}`,
      };

      const templateId = uuidv4();
      const name = patchedConfig.titleEn;
      const isPublished = i <= publishedCount;
      const isArchived = i > count - archivedCount;
      const formPurpose = isPublished ? "nonAdmin" : "";
      const publishFormType = isPublished ? "other" : "";
      const publishReason = isPublished ? "other-use" : "";
      const publishDesc = isPublished ? "1" : "";
      const ttl = isArchived ? pastTimestamp : null;

      spinner(i - 1, name);

      await pool.query(
        `INSERT INTO "Template" (
          id,
          name,
          "jsonConfig",
          "isPublished",
          "securityAttribute",
          "formPurpose",
          "publishFormType",
          "publishReason",
          "publishDesc",
          ttl,
          created_at,
          updated_at
        )
         VALUES ($1, $2, $3::jsonb, $4, 'Protected A', $5, $6, $7, $8, $9, NOW(), NOW())`,
        [
          templateId,
          name,
          JSON.stringify(patchedConfig),
          isPublished,
          formPurpose,
          publishFormType,
          publishReason,
          publishDesc,
          ttl,
        ]
      );

      await pool.query(`INSERT INTO "_TemplateToUser" ("A", "B") VALUES ($1, $2)`, [
        templateId,
        userId,
      ]);

      createdIds.push(templateId);
      spinner(i, name);
    }

    const summary = [
      `${createdIds.length} form(s) created`,
      publishedCount > 0 ? `${publishedCount} published` : null,
      archivedCount > 0 ? `${archivedCount} archived` : null,
    ]
      .filter(Boolean)
      .join(", ");

    spinner.stop(`  ✓ Done. ${summary}.`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("\nError:", (error as Error).message);
  process.exit(1);
});
