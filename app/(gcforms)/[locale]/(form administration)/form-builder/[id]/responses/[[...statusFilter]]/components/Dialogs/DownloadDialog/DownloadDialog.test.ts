import { describe, expect, it } from "vitest";
import { getVersionedZipFileName } from "./DownloadDialog";
import {
  createIndividualResponseFiles,
  csvArchiveAdapter,
  jsonArchiveAdapter,
} from "./downloadResponseFiles";
import { DownloadFormat } from "@lib/responseDownloadFormats/types";

describe("getVersionedZipFileName", () => {
  it("adds the version suffix before the zip extension", () => {
    expect(getVersionedZipFileName("responses-reponses.zip", "v3")).toBe(
      "responses-reponses-v3.zip"
    );
  });

  it("leaves the base filename unchanged without a version", () => {
    expect(getVersionedZipFileName("responses-reponses.zip", null)).toBe("responses-reponses.zip");
  });
});

describe("createIndividualResponseFiles", () => {
  it("creates the receipt and BOM-prefixed CSV files", () => {
    expect(
      createIndividualResponseFiles(
        DownloadFormat.CSV,
        { receipt: "receipt", responses: "responses" },
        "form-"
      )
    ).toEqual([
      { name: "form-receipt-recu.html", content: "receipt" },
      {
        name: "form-responses-reponses.csv",
        content: "\uFEFFresponses",
        contentType: "text/csv;charset=utf-8",
      },
    ]);
  });

  it("creates JSON output with its content type", () => {
    expect(
      createIndividualResponseFiles(
        DownloadFormat.JSON,
        { receipt: "receipt", responses: [{ answer: "value" }] },
        "form-"
      )
    ).toEqual([
      { name: "form-receipt-recu.html", content: "receipt" },
      {
        name: "form-responses-reponses.json",
        content: '[{"answer":"value"}]',
        contentType: "application/json",
      },
    ]);
  });
});

describe("archive adapters", () => {
  it("combines CSV responses and adds the UTF-8 BOM", () => {
    const firstResponse = csvArchiveAdapter.initialize({ receipt: "receipt", responses: "first" });
    const combinedResponses = csvArchiveAdapter.append(firstResponse, {
      receipt: "receipt",
      responses: "second",
    });

    expect(csvArchiveAdapter.serialize(combinedResponses)).toBe("\uFEFFfirstsecond");
  });

  it("collects and serializes JSON responses", () => {
    const firstResponse = jsonArchiveAdapter.initialize({ receipt: "receipt", responses: [] });
    const combinedResponses = jsonArchiveAdapter.append(firstResponse, {
      receipt: "receipt",
      responses: [{ answer: "value" }],
    });

    expect(jsonArchiveAdapter.serialize(combinedResponses)).toBe('[{"answer":"value"}]');
  });
});
