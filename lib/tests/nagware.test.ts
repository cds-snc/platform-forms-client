/**
 * @jest-environment node
 */

import { NagLevel, NagwareSubmission, VaultStatus } from "@lib/types";
import { detectOldUnprocessedSubmissions } from "@lib/nagware";
import { getAppSetting } from "@lib/appSettings";

jest.mock("@lib/appSettings");

function mockOldSubmission(status: VaultStatus, numberOfDaysInThePast: number): NagwareSubmission {
  return {
    status: status,
    createdAt: Date.now() - numberOfDaysInThePast * (1000 * 60 * 60 * 24),
  };
}

const mockedGetAppSetting = jest.mocked(getAppSetting, { shallow: true });

describe("Nagware - detectOldUnprocessedSubmissions", () => {
  beforeAll(() => {
    mockedGetAppSetting.mockImplementation((key) => {
      switch (key) {
        case "nagwarePhasePrompted":
          return Promise.resolve("21");
        case "nagwarePhaseWarned":
          return Promise.resolve("35");
        default:
          return Promise.resolve(null);
      }
    });
  });
  describe("Should return NagLevel.None when", () => {
    it("There is no submission", async () => {
      const sut = await detectOldUnprocessedSubmissions([]);

      expect(sut.level).toEqual(NagLevel.None);
      expect(sut.numberOfSubmissions).toEqual(0);
    });

    it("There are multiple submissions under 22 days old", async () => {
      const submissions = [
        mockOldSubmission(VaultStatus.NEW, 3),
        mockOldSubmission(VaultStatus.DOWNLOADED, 10),
        mockOldSubmission(VaultStatus.NEW, 21),
        mockOldSubmission(VaultStatus.DOWNLOADED, 21),
      ];

      const sut = await detectOldUnprocessedSubmissions(submissions);

      expect(sut.level).toEqual(NagLevel.None);
      expect(sut.numberOfSubmissions).toEqual(0);
    });
  });

  describe("Should return NagLevel.UnsavedSubmissionsOver21DaysOld when", () => {
    it("There is 1 new submission between 22 and 35 days old", async () => {
      const submissions = [
        mockOldSubmission(VaultStatus.NEW, 3),
        mockOldSubmission(VaultStatus.NEW, 10),
        mockOldSubmission(VaultStatus.NEW, 22),
      ];

      const sut = await detectOldUnprocessedSubmissions(submissions);

      expect(sut.level).toEqual(NagLevel.UnsavedSubmissionsOver21DaysOld);
      expect(sut.numberOfSubmissions).toEqual(1);
    });

    it("There are multiple new submissions between 22 and 35 days old", async () => {
      const submissions = [
        mockOldSubmission(VaultStatus.NEW, 3),
        mockOldSubmission(VaultStatus.NEW, 25),
        mockOldSubmission(VaultStatus.NEW, 22),
      ];

      const sut = await detectOldUnprocessedSubmissions(submissions);

      expect(sut.level).toEqual(NagLevel.UnsavedSubmissionsOver21DaysOld);
      expect(sut.numberOfSubmissions).toEqual(2);
    });

    it("There are multiple submissions (new and downloaded) between 22 and 35 days old", async () => {
      const submissions = [
        mockOldSubmission(VaultStatus.NEW, 3),
        mockOldSubmission(VaultStatus.NEW, 25),
        mockOldSubmission(VaultStatus.DOWNLOADED, 25),
        mockOldSubmission(VaultStatus.NEW, 22),
      ];

      const sut = await detectOldUnprocessedSubmissions(submissions);

      expect(sut.level).toEqual(NagLevel.UnsavedSubmissionsOver21DaysOld);
      expect(sut.numberOfSubmissions).toEqual(2);
    });
  });

  describe("Should return NagLevel.UnconfirmedSubmissionsOver21DaysOld when", () => {
    it("There is 1 downloaded submission between 22 and 35 days old", async () => {
      const submissions = [
        mockOldSubmission(VaultStatus.DOWNLOADED, 3),
        mockOldSubmission(VaultStatus.DOWNLOADED, 10),
        mockOldSubmission(VaultStatus.DOWNLOADED, 22),
      ];

      const sut = await detectOldUnprocessedSubmissions(submissions);

      expect(sut.level).toEqual(NagLevel.UnconfirmedSubmissionsOver21DaysOld);
      expect(sut.numberOfSubmissions).toEqual(1);
    });

    it("There are multiple downloaded submissions between 22 and 35 days old", async () => {
      const submissions = [
        mockOldSubmission(VaultStatus.DOWNLOADED, 3),
        mockOldSubmission(VaultStatus.DOWNLOADED, 25),
        mockOldSubmission(VaultStatus.DOWNLOADED, 22),
      ];

      const sut = await detectOldUnprocessedSubmissions(submissions);

      expect(sut.level).toEqual(NagLevel.UnconfirmedSubmissionsOver21DaysOld);
      expect(sut.numberOfSubmissions).toEqual(2);
    });

    it("There are multiple new submissions (under 21 days old) and downloaded submissions (between 22 and 35 days old)", async () => {
      const submissions = [
        mockOldSubmission(VaultStatus.NEW, 3),
        mockOldSubmission(VaultStatus.NEW, 21),
        mockOldSubmission(VaultStatus.DOWNLOADED, 25),
        mockOldSubmission(VaultStatus.NEW, 21),
      ];

      const sut = await detectOldUnprocessedSubmissions(submissions);

      expect(sut.level).toEqual(NagLevel.UnconfirmedSubmissionsOver21DaysOld);
      expect(sut.numberOfSubmissions).toEqual(1);
    });
  });

  describe("Should return NagLevel.UnsavedSubmissionsOver35DaysOld when", () => {
    it("There is 1 new submission over 35 days old", async () => {
      const submissions = [
        mockOldSubmission(VaultStatus.NEW, 3),
        mockOldSubmission(VaultStatus.NEW, 10),
        mockOldSubmission(VaultStatus.NEW, 36),
      ];

      const sut = await detectOldUnprocessedSubmissions(submissions);

      expect(sut.level).toEqual(NagLevel.UnsavedSubmissionsOver35DaysOld);
      expect(sut.numberOfSubmissions).toEqual(1);
    });

    it("There are multiple new submissions over 35 days old", async () => {
      const submissions = [
        mockOldSubmission(VaultStatus.NEW, 3),
        mockOldSubmission(VaultStatus.NEW, 25),
        mockOldSubmission(VaultStatus.NEW, 36),
        mockOldSubmission(VaultStatus.NEW, 40),
      ];

      const sut = await detectOldUnprocessedSubmissions(submissions);

      expect(sut.level).toEqual(NagLevel.UnsavedSubmissionsOver35DaysOld);
      expect(sut.numberOfSubmissions).toEqual(2);
    });

    it("There are multiple new or downloaded submissions (between 1 and 35 days old) and 1 new submission over 35 days old", async () => {
      const submissions = [
        mockOldSubmission(VaultStatus.NEW, 3),
        mockOldSubmission(VaultStatus.DOWNLOADED, 25),
        mockOldSubmission(VaultStatus.DOWNLOADED, 35),
        mockOldSubmission(VaultStatus.NEW, 22),
        mockOldSubmission(VaultStatus.NEW, 36),
      ];

      const sut = await detectOldUnprocessedSubmissions(submissions);

      expect(sut.level).toEqual(NagLevel.UnsavedSubmissionsOver35DaysOld);
      expect(sut.numberOfSubmissions).toEqual(1);
    });
  });

  describe("Should return NagLevel.UnconfirmedSubmissionsOver35DaysOld when", () => {
    it("There is 1 downloaded submission over 35 days old", async () => {
      const submissions = [
        mockOldSubmission(VaultStatus.DOWNLOADED, 3),
        mockOldSubmission(VaultStatus.DOWNLOADED, 10),
        mockOldSubmission(VaultStatus.DOWNLOADED, 36),
      ];

      const sut = await detectOldUnprocessedSubmissions(submissions);

      expect(sut.level).toEqual(NagLevel.UnconfirmedSubmissionsOver35DaysOld);
      expect(sut.numberOfSubmissions).toEqual(1);
    });

    it("There are multiple downloaded submissions over 35 days old", async () => {
      const submissions = [
        mockOldSubmission(VaultStatus.DOWNLOADED, 3),
        mockOldSubmission(VaultStatus.DOWNLOADED, 25),
        mockOldSubmission(VaultStatus.DOWNLOADED, 36),
        mockOldSubmission(VaultStatus.DOWNLOADED, 40),
      ];

      const sut = await detectOldUnprocessedSubmissions(submissions);

      expect(sut.level).toEqual(NagLevel.UnconfirmedSubmissionsOver35DaysOld);
      expect(sut.numberOfSubmissions).toEqual(2);
    });

    it("There are multiple new or downloaded submissions (between 1 and 35 days old) and 1 downloaded submission over 35 days old", async () => {
      const submissions = [
        mockOldSubmission(VaultStatus.NEW, 3),
        mockOldSubmission(VaultStatus.DOWNLOADED, 25),
        mockOldSubmission(VaultStatus.DOWNLOADED, 35),
        mockOldSubmission(VaultStatus.NEW, 22),
        mockOldSubmission(VaultStatus.DOWNLOADED, 36),
      ];

      const sut = await detectOldUnprocessedSubmissions(submissions);

      expect(sut.level).toEqual(NagLevel.UnconfirmedSubmissionsOver35DaysOld);
      expect(sut.numberOfSubmissions).toEqual(1);
    });
  });
});
