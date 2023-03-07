import path from "path";
import { promises as fs } from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import { middleware, cors } from "@lib/middleware";

export async function getJsonFile(req: NextApiRequest, res: NextApiResponse) {
  const { elementType } = req.body;

  const allowedTypes = ["attestation", "address", "name", "contact"];

  if (!allowedTypes.includes(elementType)) {
    res.status(400).json({ error: "Invalid element type" });
    return;
  }

  //Find the absolute path of the json directory
  const jsonDirectory = path.join(process.cwd(), "form-builder-templates");
  //Read the json data file data.json
  const fileContents = await fs.readFile(jsonDirectory + `/${elementType}.json`, "utf8");
  //Return the content of the data file in json format
  res.status(200).json(JSON.parse(fileContents));
}

export default middleware([cors({ allowedMethods: ["POST"] })], getJsonFile);
