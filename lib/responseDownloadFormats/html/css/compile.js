import shell from "shelljs";
import fs from "fs";

shell.exec(
  "npx tailwindcss -c ./tailwind.config.js -i ./css/styles.css -o ./css/output.css --minify"
);

const css = "export const css = `" + fs.readFileSync("./css/output.css", "utf8") + "`;\n";

fs.writeFileSync("./css/compiled.ts", css);
fs.unlinkSync("./css/output.css");
