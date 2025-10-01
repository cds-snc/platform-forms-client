import shell from "shelljs";
import fs from "fs";

shell.exec(
  "npx tailwindcss@3.4.1 -c ./tailwind.config.js -i ./css/styles.scss -o ./css/output.css --minify"
);

const css = "export const css = `" + fs.readFileSync("./css/output.css", "utf8") + "`;";

fs.writeFileSync("./css/compiled.ts", css);
fs.unlinkSync("./css/output.css");
