/* eslint-disable no-console */
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src", "generated", "client.ts");

try {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    const badLineIndex = lines.findIndex((line) => line.startsWith("globalThis"));
    if (badLineIndex !== -1) {
      lines[badLineIndex] = `// ${lines[badLineIndex]}`;
      fs.writeFileSync(filePath, lines.join("\n"), "utf-8");
      console.log("Successfully patched src/generated/client.ts");
    } else {
      console.log("No bad line found in src/generated/client.ts");
    }
  }
} catch (e) {
  console.error("Error patching src/generated/client.ts", e);
  process.exit(1);
}
