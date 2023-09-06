/**
 * @jest-environment node
 */

jest.mock("node-fetch", () => jest.fn());

const baseData = {
  source: 2,
  priority: 1,
  status: 2,
  product_id: 61000000642,
  group_id: 61000172262,
};

import { tagHost, formatTicketData } from "@lib/integration/freshdesk";

describe("Host tag", () => {
  test("localhost returns Dev tag", () => {
    expect(tagHost("http://localhost:3000")).toBe("Forms_Dev");
  });

  test("staging url returns Staging tag", () => {
    expect(tagHost("https://forms-staging.cdssandbox.xyz")).toBe("Forms_Staging");
  });

  test("staging url returns Staging tag", () => {
    expect(tagHost("https://forms-staging.cdssandbox.xyz")).toBe("Forms_Staging");
  });

  test("production url returns Production tag", () => {
    expect(tagHost("https://forms-formulaires.alpha.canada.ca")).toBe("Forms_Production");
    expect(tagHost("https://forms-formulaires.canada.ca")).toBe("Forms_Production");
  });
});

describe("Formats ticket data", () => {
  test("branding request generates correct data", () => {
    const brandingData = formatTicketData({
      type: "branding",
      name: "Test Name - brand",
      email: "test-branding@example.com",
      description: "Test branding description",
      language: "en",
    });

    const expectedData = {
      ...baseData,
      name: "Test Name - brand",
      email: "test-branding@example.com",
      type: "Branding Request",
      subject: "Submit a new branding option for XYZ",
      tags: ["Forms_Dev", "Forms_Request_Logo"],
      description: "Test branding description",
      custom_fields: {
        cf_language: "English",
      },
    };
    expect(brandingData).toMatchObject(expectedData);
  });

  test("publishing request generates correct data", () => {
    const publishingData = formatTicketData({
      type: "publishing",
      name: "Test Name - publishing",
      email: "test-publishing@example.com",
      description: "Test publishing description",
      language: "fr",
    });

    const expectedData = {
      ...baseData,
      name: "Test Name - publishing",
      email: "test-publishing@example.com",
      type: "Go Live Request",
      subject: "Publishing permission request for XYZ",
      tags: ["Forms_Dev", "Forms_Request_GoLive"],
      description: "Test publishing description",
      custom_fields: {
        cf_language: "Français",
      },
    };
    expect(publishingData).toMatchObject(expectedData);
  });

  test("contact request generates correct data", () => {
    const contactData = formatTicketData({
      type: "contact",
      name: "Test Name - contact",
      email: "test-contact@example.com",
      description: "Test contact description",
      language: "en",
    });

    const expectedData = {
      ...baseData,
      name: "Test Name - contact",
      email: "test-contact@example.com",
      type: "Question",
      subject: "Question from GC Forms Portal",
      tags: ["Forms_Dev"],
      description: "Test contact description",
      custom_fields: {
        cf_language: "English",
      },
    };
    expect(contactData).toMatchObject(expectedData);
  });

  test("form problem request generates correct data", () => {
    const requestData = formatTicketData({
      type: "problem",
      name: "Test Name - problem",
      email: "test-problem@example.com",
      description: "Test problem description",
      language: "fr",
    });

    const expectedData = {
      ...baseData,
      name: "Test Name - problem",
      email: "test-problem@example.com",
      type: "Problem",
      subject: "Problem with GC Forms",
      tags: ["Forms_Dev"],
      description: "Test problem description",
      custom_fields: {
        cf_language: "Français",
      },
    };
    expect(requestData).toMatchObject(expectedData);
  });
});
