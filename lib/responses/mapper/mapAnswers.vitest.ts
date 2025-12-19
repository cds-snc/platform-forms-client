import { describe, it, expect } from "vitest";
import { mapAnswers } from "./mapAnswers";
import { type MappedAnswer } from "./types";
import kitchen from "../__fixtures__/kitchen-sink-form-application-2025-10-10.json";
import answersFixture from "../__fixtures__/answers.json";
import suspiciousResponseFixture from "../__fixtures__/responses-attachments-suspicious.json";
import type { PublicFormRecord, Response } from "@gcforms/types";
import { FormProperties } from "@gcforms/types";

describe("mapAnswers", () => {
  it("maps kitchen-sink fixture answers into mapped answer objects", () => {
    const template = {
      id: "kitchen",
      form: kitchen,
      isPublished: true,
      securityAttribute: "Unclassified",
    } as unknown as PublicFormRecord;

    // answers.json stores the answers as a JSON string under the `answers` key
    const rawAnswers = JSON.parse((answersFixture as unknown as { answers: string }).answers);

    const mapped = mapAnswers({ formTemplate: template.form as FormProperties, rawAnswers });

    const radio = mapped[2];
    expect(radio.type).toBe("radio");
    expect(radio.questionId).toBe(5);
    expect(radio.answer).toBe("English");
  });

  it("creates a fallback mapped answer when question definition is missing", () => {
    const template = {
      id: "minimal",
      form: { elements: [] },
      isPublished: true,
      securityAttribute: "Unclassified",
    } as unknown as PublicFormRecord;

    const rawAnswers = { "42": { foo: "bar" } } as Record<string, unknown> as Record<
      string,
      Response
    >;

    const mapped = mapAnswers({ formTemplate: template.form as FormProperties, rawAnswers });

    expect(mapped.length).toBe(1);
    const first = mapped[0];
    if (typeof first === "string") throw new Error("expected object mapped answer");
    expect(first.type).toBe("-");
    expect(typeof first.answer).toBe("string");
    expect(String(first.answer)).toContain('"foo":"bar"');
  });

  it("handles dynamicRow answers (array of rows) and returns nested mapped answers", () => {
    const template = {
      id: "dynamic",
      form: {
        elements: [
          {
            id: 7,
            type: "dynamicRow",
            properties: {
              subElements: [
                { id: 70, type: "textField", properties: { titleEn: "A" } },
                { id: 71, type: "textField", properties: { titleEn: "B" } },
              ],
            },
          },
        ],
      },
      isPublished: true,
      securityAttribute: "Unclassified",
    } as unknown as PublicFormRecord;

    const rawAnswers = {
      "7": [
        ["row1col1", "row1col2"],
        ["r2c1", "r2c2"],
      ],
    } as unknown as Record<string, Response>;

    const mapped = mapAnswers({ formTemplate: template.form as FormProperties, rawAnswers });

    expect(mapped.length).toBe(1);
    const dyn = mapped[0];
    if (typeof dyn === "string") throw new Error("expected object mapped answer for dynamicRow");
    expect(Array.isArray(dyn.answer)).toBe(true);
    const firstRow = (dyn.answer as MappedAnswer[][])[0];
    expect(Array.isArray(firstRow)).toBe(true);
    const firstCell = firstRow[0];
    if (typeof firstCell === "string") throw new Error("expected object cell");
    expect(typeof firstCell.answer === "string").toBe(true);
  });

  it("handles file upload answers with potentially malicious attachments", () => {
    const template = {
      id: "file-upload",
      form: {
        elements: [
          {
            id: 1,
            type: "fileInput",
            properties: { titleEn: "Upload a file", titleFr: "Télécharger un fichier" },
          },
        ],
      },
      isPublished: true,
      securityAttribute: "Unclassified",
    } as unknown as PublicFormRecord;

    // Parse the answers from the fixture
    const rawAnswers = JSON.parse(suspiciousResponseFixture.answers) as Record<string, Response>;

    // Convert attachments array to Map
    const attachmentsMap = new Map(
      suspiciousResponseFixture.attachments.map((att) => [
        att.id,
        {
          originalName: att.name,
          actualName: att.name,
          isPotentiallyMalicious: att.isPotentiallyMalicious,
        },
      ])
    );

    const mapped = mapAnswers({
      formTemplate: template.form as FormProperties,
      rawAnswers: { "1": rawAnswers["1"] },
      attachments: attachmentsMap,
    });

    expect(mapped.length).toBe(1);
    const fileAnswer = mapped[0];
    if (typeof fileAnswer === "string") throw new Error("expected object mapped answer");
    expect(fileAnswer.type).toBe("fileInput");
    expect(fileAnswer.questionId).toBe(1);
    
    // Verify the answer contains the malicious flag
    expect(typeof fileAnswer.answer === "string").toBe(true);
    expect(String(fileAnswer.answer)).toContain("test.txt");
    expect(String(fileAnswer.answer)).toContain("⚠️"); // Warning emoji for malicious files
  });

  it("handles multiple file uploads with mixed malicious status", () => {
    const template = {
      id: "multi-files",
      form: {
        elements: [
          { id: 1, type: "fileInput", properties: { titleEn: "File 1", titleFr: "Fichier 1" } },
          { id: 2, type: "fileInput", properties: { titleEn: "File 2", titleFr: "Fichier 2" } },
        ],
      },
      isPublished: true,
      securityAttribute: "Unclassified",
    } as unknown as PublicFormRecord;

    // Parse the answers from the fixture
    const rawAnswers = JSON.parse(suspiciousResponseFixture.answers) as Record<string, Response>;

    // Convert attachments array to Map
    const attachmentsMap = new Map(
      suspiciousResponseFixture.attachments.map((att) => [
        att.id,
        {
          originalName: att.name,
          actualName: att.name,
          isPotentiallyMalicious: att.isPotentiallyMalicious,
        },
      ])
    );

    const mapped = mapAnswers({
      formTemplate: template.form as FormProperties,
      rawAnswers: { "1": rawAnswers["1"], "2": rawAnswers["2"] },
      attachments: attachmentsMap,
    });

    expect(mapped.length).toBe(2);
    
    // First file should be malicious
    const file1 = mapped[0];
    if (typeof file1 === "string") throw new Error("expected object mapped answer");
    expect(file1.questionId).toBe(1);
    expect(String(file1.answer)).toContain("test.txt");
    expect(String(file1.answer)).toContain("⚠️");
    
    // Second file should be safe
    const file2 = mapped[1];
    if (typeof file2 === "string") throw new Error("expected object mapped answer");
    expect(file2.questionId).toBe(2);
    expect(String(file2.answer)).toContain("test.docx");
    expect(String(file2.answer)).not.toContain("⚠️");
  });

  it("handles dynamicRow with file uploads containing malicious attachments", () => {
    const template = {
      id: "dynamic-files",
      form: {
        elements: [
          {
            id: 3,
            type: "dynamicRow",
            properties: {
              titleEn: "Files",
              titleFr: "Fichiers",
              subElements: [
                { id: 30, type: "fileInput", properties: { titleEn: "File", titleFr: "Fichier" } },
              ],
            },
          },
        ],
      },
      isPublished: true,
      securityAttribute: "Unclassified",
    } as unknown as PublicFormRecord;

    // Parse the answers from the fixture - question 3 is the dynamicRow
    const rawAnswers = JSON.parse(suspiciousResponseFixture.answers) as Record<string, Response>;

    // Convert attachments array to Map
    const attachmentsMap = new Map(
      suspiciousResponseFixture.attachments.map((att) => [
        att.id,
        {
          originalName: att.name,
          actualName: att.name,
          isPotentiallyMalicious: att.isPotentiallyMalicious,
        },
      ])
    );

    const mapped = mapAnswers({
      formTemplate: template.form as FormProperties,
      rawAnswers: { "3": rawAnswers["3"] },
      attachments: attachmentsMap,
    });

    expect(mapped.length).toBe(1);
    const dynAnswer = mapped[0];
    if (typeof dynAnswer === "string") throw new Error("expected object mapped answer");
    expect(dynAnswer.type).toBe("dynamicRow");
    expect(Array.isArray(dynAnswer.answer)).toBe(true);
    
    const rows = dynAnswer.answer as MappedAnswer[][];
    expect(rows.length).toBe(2);
    
    // First row should have malicious file (output.txt)
    const firstRowFile = rows[0][0];
    if (typeof firstRowFile === "string") throw new Error("expected file answer object");
    expect(String(firstRowFile.answer)).toContain("output.txt");
    expect(String(firstRowFile.answer)).toContain("⚠️");
    
    // Second row should have safe file (champ-cat.png)
    const secondRowFile = rows[1][0];
    if (typeof secondRowFile === "string") throw new Error("expected file answer object");
    expect(String(secondRowFile.answer)).toContain("champ-cat.png");
    expect(String(secondRowFile.answer)).not.toContain("⚠️");
  });

  it("handles file uploads when attachments metadata is not provided", () => {
    const template = {
      id: "file-upload-no-meta",
      form: {
        elements: [
          {
            id: 1,
            type: "fileInput",
            properties: { titleEn: "Upload a file", titleFr: "Télécharger un fichier" },
          },
        ],
      },
      isPublished: true,
      securityAttribute: "Unclassified",
    } as unknown as PublicFormRecord;

    const rawAnswers = JSON.parse(suspiciousResponseFixture.answers) as Record<string, Response>;

    // Call without attachments parameter
    const mapped = mapAnswers({
      formTemplate: template.form as FormProperties,
      rawAnswers: { "1": rawAnswers["1"] },
    });

    expect(mapped.length).toBe(1);
    const fileAnswer = mapped[0];
    if (typeof fileAnswer === "string") throw new Error("expected object mapped answer");
    expect(fileAnswer.type).toBe("fileInput");
    // Should still show the filename from rawAnswers
    expect(String(fileAnswer.answer)).toContain("test.txt");
    // Should not have warning emoji when metadata is missing
    expect(String(fileAnswer.answer)).not.toContain("⚠️");
  });
});