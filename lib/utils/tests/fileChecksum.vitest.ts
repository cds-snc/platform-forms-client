import { describe, it, expect } from "vitest";
import {
  calculateMD5Checksum,
  calculateFileChecksum,
  generateFileChecksums,
} from "../fileChecksum";
import { FileInput } from "@gcforms/types";
import { readFileSync } from "fs";
import { join } from "path";

describe("fileChecksum", () => {
  // Helper function to load CSV fixtures
  const loadCsvFixture = (filename: string): ArrayBuffer => {
    const csvPath = join(__dirname, "fixtures", filename);
    return readFileSync(csvPath).buffer;
  };

  describe("calculateMD5Checksum", () => {
    it("should calculate MD5 checksum for file content", async () => {
      const content = loadCsvFixture("sample.csv");
      const checksum = await calculateMD5Checksum(content);

      // This checksum should be consistent for the sample.csv file
      expect(checksum).toBeTruthy();
      expect(typeof checksum).toBe("string");
    });

    it("should return different checksums for different content", async () => {
      const content1 = loadCsvFixture("sample.csv");
      const content2 = new TextEncoder().encode("Different content").buffer;

      const checksum1 = await calculateMD5Checksum(content1);
      const checksum2 = await calculateMD5Checksum(content2);

      expect(checksum1).not.toBe(checksum2);
    });

    it("should return same checksum for same content", async () => {
      const content1 = loadCsvFixture("sample.csv");
      const content2 = loadCsvFixture("sample-copy.csv");

      const checksum1 = await calculateMD5Checksum(content1);
      const checksum2 = await calculateMD5Checksum(content2);

      expect(checksum1).toBe(checksum2);
    });
  });

  describe("calculateFileChecksum", () => {
    it("should calculate checksum for FileInput object", async () => {
      const csvContent = loadCsvFixture("sample.csv");
      const file: FileInput = {
        name: "sample.csv",
        size: csvContent.byteLength,
        content: csvContent,
      };

      const checksum = await calculateFileChecksum(file);
      expect(checksum).toBeTruthy();
      expect(typeof checksum).toBe("string");
    });

    it("should throw error for file without content", async () => {
      const file = {
        name: "test.txt",
        size: 0,
        content: null,
      } as unknown as FileInput;

      expect(calculateFileChecksum(file)).rejects.toThrow(
        "Unable to calculate checksum for file test.txt: no content available"
      );
    });
  });

  describe("generateFileChecksums", () => {
    it("should generate checksums for multiple files", async () => {
      const csvContent1 = loadCsvFixture("sample.csv");
      const csvContent2 = loadCsvFixture("sample-copy.csv");

      const fileObjsRef = {
        file1: {
          name: "sample.csv",
          size: csvContent1.byteLength,
          content: csvContent1,
        } as FileInput,
        file2: {
          name: "sample-copy.csv",
          size: csvContent2.byteLength,
          content: csvContent2,
        } as FileInput,
      };

      const checksums = await generateFileChecksums(fileObjsRef);

      expect(checksums).toHaveProperty("file1");
      expect(checksums).toHaveProperty("file2");
      // Both files have identical content, so checksums should be the same
      expect(checksums.file1).toBe(checksums.file2);
    });

    it("should handle empty file objects", async () => {
      const checksums = await generateFileChecksums({});
      expect(checksums).toEqual({});
    });

    it("should continue processing when one file fails", async () => {
      const csvContent = loadCsvFixture("sample.csv");

      const fileObjsRef = {
        file1: {
          name: "sample.csv",
          size: csvContent.byteLength,
          content: csvContent,
        } as FileInput,
        file2: {
          name: "broken.csv",
          size: 0,
          content: null,
        } as unknown as FileInput,
      };

      const checksums = await generateFileChecksums(fileObjsRef);

      expect(checksums).toHaveProperty("file1");
      expect(checksums).not.toHaveProperty("file2");
      expect(typeof checksums.file1).toBe("string");
    });
  });
});
