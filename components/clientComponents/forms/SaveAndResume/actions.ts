"use server";

import { promises as fs } from "fs";

export const saveProgressData = async ({
  formTitle,
  formData,
}: {
  formTitle: string;
  formData: string;
}) => {
  try {
    const dir = "public/static/save-and-resume";
    let fileContents = await fs.readFile(dir + `/response.html`, "utf8");

    // Replace placeholders with form data
    fileContents = fileContents.replace(/{{FORM_TITLE}}/g, formTitle);
    fileContents = fileContents.replace(/{{FORM_DATA_BASE64}}/g, formData);

    return { data: fileContents };
  } catch (error) {
    return { data: "", error: (error as Error).message };
  }
};
