import fs from "fs";
import path from "path";

const fixturesDir = path.resolve(__dirname, "../__fixtures__");
const templatePath = path.join(fixturesDir, "validFormTemplate.json");
const answersPath = path.join(
  __dirname,
  "../app/(gcforms)/[locale]/(form administration)/api_integration/lib/csv/__fixtures__/answers.json"
);

const formTemplate = JSON.parse(fs.readFileSync(templatePath, "utf8"));
const answersWrapper = JSON.parse(fs.readFileSync(answersPath, "utf8"));
let rawAnswers: Record<string, unknown> = {};
try {
  rawAnswers = JSON.parse(String(answersWrapper.answers));
} catch (e) {
  rawAnswers = answersWrapper.answers || {};
}

async function run() {
  try {
    // Try to import the buildCsvContent function from the project
    // This may fail due to ESM resolution quirks; if so we'll fall back.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(
      "../app/(gcforms)/[locale]/(form administration)/api_integration/lib/csv/csvContent"
    );
    if (mod && typeof mod.buildCsvContent === "function") {
      const { headers, records } = mod.buildCsvContent({
        formTemplate,
        rawAnswers,
      });



      console.log("HEADERS:");
      console.log(JSON.stringify(headers, null, 2));
      console.log("\nRECORDS:");
      console.log(JSON.stringify(records, null, 2));
      return;
    }
  } catch (err) {
    // fallthrough to simple logic
  }

}

run();
