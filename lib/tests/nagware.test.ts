/**
 * @jest-environment node
 */

import { NagLevel, NagwareSubmission } from "@lib/types";
import { detectOldUnprocessedSubmissions } from "@lib/nagware";

enum MockStatus {
  New,
  Downloaded,
}

function mockOldSubmission(status: MockStatus, numberOfDaysInThePast: number): NagwareSubmission {
  return {
    status: status === MockStatus.New ? "New" : "Downloaded",
    createdAt: Date.now() - numberOfDaysInThePast * (1000 * 60 * 60 * 24),
  };
}

describe("Nagware - detectOldUnprocessedSubmissions", () => {
  describe("Should return NagLevel.None when", () => {
    it("There is no submission", () => {
      const sut = detectOldUnprocessedSubmissions([]);

      expect(sut.level).toEqual(NagLevel.None);
      expect(sut.numberOfSubmissions).toEqual(0);
    });

    it("There are multiple submissions under 22 days old", () => {
      const submissions = [
        mockOldSubmission(MockStatus.New, 3),
        mockOldSubmission(MockStatus.Downloaded, 10),
        mockOldSubmission(MockStatus.New, 21),
        mockOldSubmission(MockStatus.Downloaded, 21),
      ];

      const sut = detectOldUnprocessedSubmissions(submissions);

      expect(sut.level).toEqual(NagLevel.None);
      expect(sut.numberOfSubmissions).toEqual(0);
    });
  });

  describe("Should return NagLevel.UnsavedSubmissionsOver21DaysOld when", () => {
    it("There is 1 new submission between 22 and 35 days old", () => {
      const submissions = [
        mockOldSubmission(MockStatus.New, 3),
        mockOldSubmission(MockStatus.New, 10),
        mockOldSubmission(MockStatus.New, 22),
      ];

      const sut = detectOldUnprocessedSubmissions(submissions);

      expect(sut.level).toEqual(NagLevel.UnsavedSubmissionsOver21DaysOld);
      expect(sut.numberOfSubmissions).toEqual(1);
    });

    it("There are multiple new submissions between 22 and 35 days old", () => {
      const submissions = [
        mockOldSubmission(MockStatus.New, 3),
        mockOldSubmission(MockStatus.New, 25),
        mockOldSubmission(MockStatus.New, 22),
      ];

      const sut = detectOldUnprocessedSubmissions(submissions);

      expect(sut.level).toEqual(NagLevel.UnsavedSubmissionsOver21DaysOld);
      expect(sut.numberOfSubmissions).toEqual(2);
    });

    it("There are multiple submissions (new and downloaded) between 22 and 35 days old", () => {
      const submissions = [
        mockOldSubmission(MockStatus.New, 3),
        mockOldSubmission(MockStatus.New, 25),
        mockOldSubmission(MockStatus.Downloaded, 25),
        mockOldSubmission(MockStatus.New, 22),
      ];

      const sut = detectOldUnprocessedSubmissions(submissions);

      expect(sut.level).toEqual(NagLevel.UnsavedSubmissionsOver21DaysOld);
      expect(sut.numberOfSubmissions).toEqual(2);
    });
  });

  describe("Should return NagLevel.UnconfirmedSubmissionsOver21DaysOld when", () => {
    it("There is 1 downloaded submission between 22 and 35 days old", () => {
      const submissions = [
        mockOldSubmission(MockStatus.Downloaded, 3),
        mockOldSubmission(MockStatus.Downloaded, 10),
        mockOldSubmission(MockStatus.Downloaded, 22),
      ];

      const sut = detectOldUnprocessedSubmissions(submissions);

      expect(sut.level).toEqual(NagLevel.UnconfirmedSubmissionsOver21DaysOld);
      expect(sut.numberOfSubmissions).toEqual(1);
    });

    it("There are multiple downloaded submissions between 22 and 35 days old", () => {
      const submissions = [
        mockOldSubmission(MockStatus.Downloaded, 3),
        mockOldSubmission(MockStatus.Downloaded, 25),
        mockOldSubmission(MockStatus.Downloaded, 22),
      ];

      const sut = detectOldUnprocessedSubmissions(submissions);

      expect(sut.level).toEqual(NagLevel.UnconfirmedSubmissionsOver21DaysOld);
      expect(sut.numberOfSubmissions).toEqual(2);
    });

    it("There are multiple new submissions (under 21 days old) and downloaded submissions (between 22 and 35 days old)", () => {
      const submissions = [
        mockOldSubmission(MockStatus.New, 3),
        mockOldSubmission(MockStatus.New, 21),
        mockOldSubmission(MockStatus.Downloaded, 25),
        mockOldSubmission(MockStatus.New, 21),
      ];

      const sut = detectOldUnprocessedSubmissions(submissions);

      expect(sut.level).toEqual(NagLevel.UnconfirmedSubmissionsOver21DaysOld);
      expect(sut.numberOfSubmissions).toEqual(1);
    });
  });

  describe("Should return NagLevel.UnsavedSubmissionsOver35DaysOld when", () => {
    it("There is 1 new submission over 35 days old", () => {
      const submissions = [
        mockOldSubmission(MockStatus.New, 3),
        mockOldSubmission(MockStatus.New, 10),
        mockOldSubmission(MockStatus.New, 36),
      ];

      const sut = detectOldUnprocessedSubmissions(submissions);

      expect(sut.level).toEqual(NagLevel.UnsavedSubmissionsOver35DaysOld);
      expect(sut.numberOfSubmissions).toEqual(1);
    });

    it("There are multiple new submissions over 35 days old", () => {
      const submissions = [
        mockOldSubmission(MockStatus.New, 3),
        mockOldSubmission(MockStatus.New, 25),
        mockOldSubmission(MockStatus.New, 36),
        mockOldSubmission(MockStatus.New, 40),
      ];

      const sut = detectOldUnprocessedSubmissions(submissions);

      expect(sut.level).toEqual(NagLevel.UnsavedSubmissionsOver35DaysOld);
      expect(sut.numberOfSubmissions).toEqual(2);
    });

    it("There are multiple new or downloaded submissions (between 1 and 35 days old) and 1 new submission over 35 days old", () => {
      const submissions = [
        mockOldSubmission(MockStatus.New, 3),
        mockOldSubmission(MockStatus.Downloaded, 25),
        mockOldSubmission(MockStatus.Downloaded, 35),
        mockOldSubmission(MockStatus.New, 22),
        mockOldSubmission(MockStatus.New, 36),
      ];

      const sut = detectOldUnprocessedSubmissions(submissions);

      expect(sut.level).toEqual(NagLevel.UnsavedSubmissionsOver35DaysOld);
      expect(sut.numberOfSubmissions).toEqual(1);
    });
  });

  describe("Should return NagLevel.UnconfirmedSubmissionsOver35DaysOld when", () => {
    it("There is 1 downloaded submission over 35 days old", () => {
      const submissions = [
        mockOldSubmission(MockStatus.Downloaded, 3),
        mockOldSubmission(MockStatus.Downloaded, 10),
        mockOldSubmission(MockStatus.Downloaded, 36),
      ];

      const sut = detectOldUnprocessedSubmissions(submissions);

      expect(sut.level).toEqual(NagLevel.UnconfirmedSubmissionsOver35DaysOld);
      expect(sut.numberOfSubmissions).toEqual(1);
    });

    it("There are multiple downloaded submissions over 35 days old", () => {
      const submissions = [
        mockOldSubmission(MockStatus.Downloaded, 3),
        mockOldSubmission(MockStatus.Downloaded, 25),
        mockOldSubmission(MockStatus.Downloaded, 36),
        mockOldSubmission(MockStatus.Downloaded, 40),
      ];

      const sut = detectOldUnprocessedSubmissions(submissions);

      expect(sut.level).toEqual(NagLevel.UnconfirmedSubmissionsOver35DaysOld);
      expect(sut.numberOfSubmissions).toEqual(2);
    });

    it("There are multiple new or downloaded submissions (between 1 and 35 days old) and 1 downloaded submission over 35 days old", () => {
      const submissions = [
        mockOldSubmission(MockStatus.New, 3),
        mockOldSubmission(MockStatus.Downloaded, 25),
        mockOldSubmission(MockStatus.Downloaded, 35),
        mockOldSubmission(MockStatus.New, 22),
        mockOldSubmission(MockStatus.Downloaded, 36),
      ];

      const sut = detectOldUnprocessedSubmissions(submissions);

      expect(sut.level).toEqual(NagLevel.UnconfirmedSubmissionsOver35DaysOld);
      expect(sut.numberOfSubmissions).toEqual(1);
    });
  });
});
