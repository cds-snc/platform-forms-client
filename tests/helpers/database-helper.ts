import { PrismaClient, Prisma } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

export class DatabaseHelper {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Create a published template directly in the database from a fixture file
   * @param fixtureName - Name of the fixture file (without .json extension)
   * @param userEmail - User email to associate with the template (defaults to test user)
   * @returns The created template ID
   */
  async createPublishedTemplate(
    fixtureName: string,
    userEmail: string = "test.user@cds-snc.ca" // Default test user from seed
  ): Promise<string> {
    // Find the user by email
    const user = await this.prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      throw new Error(`User with email ${userEmail} not found in database`);
    }

    // Load the fixture file
    const fixturePath = path.join(__dirname, "../../__fixtures__", `${fixtureName}.json`);
    const fixtureContent = fs.readFileSync(fixturePath, "utf-8");
    const formConfig = JSON.parse(fixtureContent);

    // Create the template
    const template = await this.prisma.template.create({
      data: {
        name: formConfig.titleEn || "Test Form",
        jsonConfig: formConfig as Prisma.JsonObject,
        isPublished: true,
        formPurpose: "Testing purposes",
        publishReason: "Initial",
        publishFormType: "test",
        publishDesc: "Test form created for automated testing",
        users: {
          connect: { id: user.id },
        },
      },
    });

    return template.id;
  }

  /**
   * Delete a template from the database
   * @param templateId - The template ID to delete
   */
  async deleteTemplate(templateId: string): Promise<void> {
    await this.prisma.template.delete({
      where: { id: templateId },
    });
  }

  /**
   * Clean up and disconnect from the database
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
