import shell from "shelljs";
import fs from "fs";

// Step 1: Compile SCSS to CSS using Sass

// eslint-disable-next-line no-console
console.log("Compiling SCSS to CSS...");
const sassResult = shell.exec(
  "npx sass --load-path=../../../../node_modules --load-path=../../../../styles ./css/styles.scss ./css/temp.css --no-source-map",
  { silent: true }
);

if (sassResult.code !== 0) {
  // eslint-disable-next-line no-console
  console.error("SCSS compilation failed:");
  // eslint-disable-next-line no-console
  console.error(sassResult.stderr);
  process.exit(1);
}

// Step 2: Process the compiled CSS with Tailwind
// eslint-disable-next-line no-console
console.log("Processing CSS with Tailwind...");
const tailwindResult = shell.exec(
  "npx tailwindcss@3.4.1 -c ./tailwind.config.js -i ./css/temp.css -o ./css/output.css --minify",
  { silent: true }
);

if (tailwindResult.code !== 0) {
  // eslint-disable-next-line no-console
  console.error("Tailwind compilation failed:");
  // eslint-disable-next-line no-console
  console.error(tailwindResult.stderr);
  // Clean up temp file before exiting
  if (fs.existsSync("./css/temp.css")) {
    fs.unlinkSync("./css/temp.css");
  }
  process.exit(1);
}

// Step 3: Generate the TypeScript export
const css = "export const css = `" + fs.readFileSync("./css/output.css", "utf8") + "`;";
fs.writeFileSync("./css/compiled.ts", css);

// Clean up temporary files
fs.unlinkSync("./css/output.css");
if (fs.existsSync("./css/temp.css")) {
  fs.unlinkSync("./css/temp.css");
}

// eslint-disable-next-line no-console
console.log("CSS compilation completed successfully!");
