import path from "path";
import { promises as fs } from "fs";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { elementType } = req.body;

  const allowedTypes = ["attestation"];

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
