import path from "path";
import { promises as fs } from "fs";
import { type NextRequest, NextResponse } from "next/server";
import { allowedTemplates } from "@lib/utils/form-builder";

export const POST = async (req: NextRequest) => {
  const { elementType } = await req.json();
  if (!allowedTemplates.includes(elementType)) {
    return NextResponse.json({ error: "Invalid element type" }, { status: 400 });
  }
  //Find the absolute path of the json directory
  const jsonDirectory = path.join(process.cwd(), "form-builder-templates");
  //Read the json data file data.json
  const fileContents = await fs.readFile(jsonDirectory + `/${elementType}.json`, "utf8");
  //Return the content of the data file in json format
  return NextResponse.json(JSON.parse(fileContents));
};
