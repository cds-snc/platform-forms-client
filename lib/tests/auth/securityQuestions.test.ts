/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { prismaMock } from "@jestUtils";
import {
  retrievePoolOfSecurityQuestions,
  createSecurityAnswers,
  AlreadyHasSecurityAnswers,
  InvalidSecurityQuestionId,
  DuplicatedQuestionsNotAllowed,
  SecurityQuestionDatabaseOperationFailed,
  userHasSecurityQuestions,
  retrieveUserSecurityQuestions,
  updateSecurityAnswer,
  SecurityAnswersNotFound,
  SecurityQuestionNotFound,
  validateSecurityAnswers,
} from "@lib/auth/securityQuestions/securityQuestions";
import { hash, verifyHash } from "@lib/auth/securityQuestions/hashing";

jest.mock("@lib/auth/securityQuestions/hashing");
const mockHash = jest.mocked(hash, { shallow: true });
const mockVerifyHash = jest.mocked(verifyHash, { shallow: true });

describe("Test Security Questions library", () => {
  describe("Test retrievePoolOfSecurityQuestions function", () => {
    it("Should return complete pool of security questions", async () => {
      (prismaMock.securityQuestion.findMany as jest.MockedFunction<any>).mockResolvedValueOnce([
        {
          deprecated: false,
          id: "uuid1",
          questionEn: "questionEn1",
          questionFr: "questionFR1",
        },
        {
          deprecated: true,
          id: "uuid2",
          questionEn: "questionEn2",
          questionFr: "questionFR2",
        },
      ]);

      const sut = await retrievePoolOfSecurityQuestions();

      expect(sut).toEqual([
        {
          deprecated: false,
          id: "uuid1",
          questionEn: "questionEn1",
          questionFr: "questionFR1",
        },
        {
          deprecated: true,
          id: "uuid2",
          questionEn: "questionEn2",
          questionFr: "questionFR2",
        },
      ]);
    });
  });

  describe("Test createSecurityAnswers function", () => {
    it("Cannot override existing set of answers", async () => {
      (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce({
        securityAnswers: [
          {
            id: "uuid",
            question: {
              deprecated: false,
              id: "uuid",
            },
            answer: "answer",
          },
        ],
      });

      await expect(async () => {
        await createSecurityAnswers({
          userId: "uuid",
          questionsWithAssociatedAnswers: [{ questionId: "uuid", answer: "answer" }],
        });
      }).rejects.toThrowError(AlreadyHasSecurityAnswers);
    });

    it("Throws exception if selected question identifiers are not valid", async () => {
      (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce({
        securityAnswers: [],
      });

      (prismaMock.securityQuestion.findMany as jest.MockedFunction<any>).mockResolvedValueOnce([
        {
          deprecated: false,
          id: "uuid1",
        },
        {
          deprecated: false,
          id: "uuid2",
        },
      ]);

      await expect(async () => {
        await createSecurityAnswers({
          userId: "uuid",
          questionsWithAssociatedAnswers: [{ questionId: "uuid", answer: "answer" }],
        });
      }).rejects.toThrowError(InvalidSecurityQuestionId);
    });

    it("Throws exception if selected question are deprecated", async () => {
      (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce({
        securityAnswers: [],
      });

      (prismaMock.securityQuestion.findMany as jest.MockedFunction<any>).mockResolvedValueOnce([
        {
          deprecated: false,
          id: "uuid1",
        },
        {
          deprecated: true,
          id: "uuid2",
        },
      ]);

      await expect(async () => {
        await createSecurityAnswers({
          userId: "uuid",
          questionsWithAssociatedAnswers: [{ questionId: "uuid2", answer: "answer" }],
        });
      }).rejects.toThrowError(InvalidSecurityQuestionId);
    });

    it("Throws exception if selected questions are the same", async () => {
      (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce({
        securityAnswers: [],
      });

      (prismaMock.securityQuestion.findMany as jest.MockedFunction<any>).mockResolvedValueOnce([
        {
          deprecated: false,
          id: "uuid1",
        },
        {
          deprecated: false,
          id: "uuid2",
        },
      ]);

      await expect(async () => {
        await createSecurityAnswers({
          userId: "uuid",
          questionsWithAssociatedAnswers: [
            { questionId: "uuid1", answer: "answer" },
            { questionId: "uuid1", answer: "answer" },
          ],
        });
      }).rejects.toThrowError(DuplicatedQuestionsNotAllowed);
    });

    it("Throws exception if database update operation fails or returns null", async () => {
      (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce({
        securityAnswers: [],
      });

      (prismaMock.securityQuestion.findMany as jest.MockedFunction<any>).mockResolvedValueOnce([
        {
          deprecated: false,
          id: "uuid1",
        },
        {
          deprecated: false,
          id: "uuid2",
        },
      ]);

      (prismaMock.user.update as jest.MockedFunction<any>).mockResolvedValueOnce(null);

      mockHash.mockResolvedValueOnce("mockedHash");

      await expect(async () => {
        await createSecurityAnswers({
          userId: "uuid",
          questionsWithAssociatedAnswers: [{ questionId: "uuid2", answer: "answer" }],
        });
      }).rejects.toThrowError(SecurityQuestionDatabaseOperationFailed);
    });

    it("Works as expected and triggers database update", async () => {
      (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce({
        securityAnswers: [],
      });

      (prismaMock.securityQuestion.findMany as jest.MockedFunction<any>).mockResolvedValueOnce([
        {
          deprecated: false,
          id: "uuid1",
        },
        {
          deprecated: false,
          id: "uuid2",
        },
      ]);

      (prismaMock.user.update as jest.MockedFunction<any>).mockResolvedValueOnce({});

      mockHash.mockResolvedValue("mockedHash");

      await createSecurityAnswers({
        userId: "uuid",
        questionsWithAssociatedAnswers: [
          { questionId: "uuid1", answer: "answer" },
          { questionId: "uuid2", answer: "answer" },
        ],
      });

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: {
          id: "uuid",
        },
        data: {
          securityAnswers: {
            create: [
              {
                answer: "mockedHash",
                question: {
                  connect: {
                    id: "uuid1",
                  },
                },
              },
              {
                answer: "mockedHash",
                question: {
                  connect: {
                    id: "uuid2",
                  },
                },
              },
            ],
          },
        },
      });
    });
  });

  describe("Test updateSecurityAnswer function", () => {
    it("Throws exception if no security question exist", async () => {
      (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce({
        securityAnswers: [],
      });

      await expect(async () => {
        await updateSecurityAnswer({
          userId: "uuid",
          oldQuestionId: "olduuid",
          newQuestionId: "newuuid",
          newAnswer: "answer",
        });
      }).rejects.toThrowError(SecurityAnswersNotFound);
    });

    it("Throws exception if selected question identifiers are not valid", async () => {
      (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce({
        securityAnswers: [
          {
            id: "uuid",
            question: {
              deprecated: false,
              id: "uuid",
            },
            answer: "answer",
          },
        ],
      });

      (prismaMock.securityQuestion.findMany as jest.MockedFunction<any>).mockResolvedValueOnce([
        {
          deprecated: false,
          id: "uuid1",
        },
        {
          deprecated: false,
          id: "uuid2",
        },
      ]);

      await expect(async () => {
        await updateSecurityAnswer({
          userId: "uuid",
          oldQuestionId: "olduuid",
          newQuestionId: "newuuid",
          newAnswer: "answer",
        });
      }).rejects.toThrowError(InvalidSecurityQuestionId);
    });

    it("Throws exception if update is done on non selected question", async () => {
      (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce({
        securityAnswers: [
          {
            id: "uuid",
            question: {
              deprecated: false,
              id: "uuid",
            },
            answer: "answer",
          },
        ],
      });

      (prismaMock.securityQuestion.findMany as jest.MockedFunction<any>).mockResolvedValueOnce([
        {
          deprecated: false,
          id: "uuid1",
        },
        {
          deprecated: false,
          id: "uuid2",
        },
      ]);

      await expect(async () => {
        await updateSecurityAnswer({
          userId: "uuid",
          oldQuestionId: "uuid1",
          newQuestionId: "uuid2",
          newAnswer: "answer",
        });
      }).rejects.toThrowError(SecurityQuestionNotFound);
    });

    it("Throws exception if new selected question had already been chosen", async () => {
      (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce({
        securityAnswers: [
          {
            id: "uuid",
            question: {
              deprecated: false,
              id: "uuid",
            },
            answer: "answer",
          },
          {
            id: "uuid2",
            question: {
              deprecated: false,
              id: "uuid2",
            },
            answer: "answer",
          },
        ],
      });

      (prismaMock.securityQuestion.findMany as jest.MockedFunction<any>).mockResolvedValueOnce([
        {
          deprecated: false,
          id: "uuid2",
        },
        {
          deprecated: false,
          id: "uuid3",
        },
      ]);

      await expect(async () => {
        await updateSecurityAnswer({
          userId: "uuid",
          oldQuestionId: "uuid",
          newQuestionId: "uuid2",
          newAnswer: "answer",
        });
      }).rejects.toThrowError(DuplicatedQuestionsNotAllowed);
    });

    it("Throws exception if database update operation fails or returns null", async () => {
      (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce({
        securityAnswers: [
          {
            id: "uuid",
            question: {
              deprecated: false,
              id: "uuid",
            },
            answer: "answer",
          },
        ],
      });

      (prismaMock.securityQuestion.findMany as jest.MockedFunction<any>).mockResolvedValueOnce([
        {
          deprecated: false,
          id: "uuid2",
        },
        {
          deprecated: false,
          id: "uuid3",
        },
      ]);

      mockHash.mockResolvedValueOnce("mockedHash");

      (prismaMock.securityAnswer.update as jest.MockedFunction<any>).mockResolvedValueOnce(null);

      await expect(async () => {
        await updateSecurityAnswer({
          userId: "uuid",
          oldQuestionId: "uuid",
          newQuestionId: "uuid2",
          newAnswer: "answer",
        });
      }).rejects.toThrowError(SecurityQuestionDatabaseOperationFailed);
    });

    it("Works as expected and triggers database update", async () => {
      (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce({
        securityAnswers: [
          {
            id: "uuid",
            question: {
              deprecated: false,
              id: "uuid",
            },
            answer: "answer",
          },
        ],
      });

      (prismaMock.securityQuestion.findMany as jest.MockedFunction<any>).mockResolvedValueOnce([
        {
          deprecated: false,
          id: "uuid2",
        },
        {
          deprecated: false,
          id: "uuid3",
        },
      ]);

      mockHash.mockResolvedValueOnce("mockedHash");

      (prismaMock.securityAnswer.update as jest.MockedFunction<any>).mockResolvedValueOnce({});

      await updateSecurityAnswer({
        userId: "uuid",
        oldQuestionId: "uuid",
        newQuestionId: "uuid2",
        newAnswer: "answer",
      });

      expect(prismaMock.securityAnswer.update).toHaveBeenCalledWith({
        where: {
          id: "uuid",
        },
        data: {
          question: {
            connect: {
              id: "uuid2",
            },
          },
          answer: "mockedHash",
        },
      });
    });
  });

  describe("Test retrieveUserSecurityQuestions function", () => {
    it("Should return security questions", async () => {
      (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce({
        securityAnswers: [
          {
            id: "uuid",
            question: {
              deprecated: false,
              id: "uuid",
              questionEn: "questionEn",
              questionFr: "questionFR",
            },
            answer: "answer",
          },
          {
            id: "uuid2",
            question: {
              deprecated: false,
              id: "uuid2",
              questionEn: "questionEn2",
              questionFr: "questionFR2",
            },
            answer: "answer2",
          },
          {
            id: "uuid3",
            question: {
              deprecated: false,
              id: "uuid3",
              questionEn: "questionEn3",
              questionFr: "questionFR3",
            },
            answer: "answer3",
          },
        ],
      });

      const sut = await retrieveUserSecurityQuestions({ userId: "uuid", email: "email" });

      expect(sut).toEqual([
        {
          deprecated: false,
          id: "uuid",
          questionEn: "questionEn",
          questionFr: "questionFR",
        },
        {
          deprecated: false,
          id: "uuid2",
          questionEn: "questionEn2",
          questionFr: "questionFR2",
        },
        {
          deprecated: false,
          id: "uuid3",
          questionEn: "questionEn3",
          questionFr: "questionFR3",
        },
      ]);
    });
  });

  describe("Test userHasSecurityQuestions function", () => {
    it("Returns false if no security question exist", async () => {
      (prismaMock.securityAnswer.count as jest.MockedFunction<any>).mockResolvedValueOnce(0);

      const sut = await userHasSecurityQuestions({
        userId: "uuid",
      });

      expect(sut).toBe(false);
    });

    it("Returns true if security questions exist", async () => {
      (prismaMock.securityAnswer.count as jest.MockedFunction<any>).mockResolvedValueOnce(3);

      const sut = await userHasSecurityQuestions({
        userId: "uuid",
      });

      expect(sut).toBe(true);
    });
  });

  describe("Test validateSecurityAnswers function", () => {
    it("Returns false is number of given answers does not match what is stored in the database", async () => {
      (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce({
        securityAnswers: [
          {
            id: "uuid",
            question: {
              deprecated: false,
              id: "uuid",
            },
            answer: "answer",
          },
        ],
      });

      const sut = await validateSecurityAnswers({
        email: "email",
        questionsWithAssociatedAnswers: [
          {
            questionId: "uuid",
            answer: "answer",
          },
          {
            questionId: "uuid2",
            answer: "answer2",
          },
        ],
      });

      expect(sut).toBe(false);
    });

    it("Returns false is given answer values does not match what is stored in the database", async () => {
      (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce({
        securityAnswers: [
          {
            id: "uuid",
            question: {
              deprecated: false,
              id: "uuid",
            },
            answer: "answer",
          },
          {
            id: "uuid2",
            question: {
              deprecated: false,
              id: "uuid2",
            },
            answer: "answer2",
          },
        ],
      });

      mockVerifyHash.mockImplementation((hash, value) => {
        return Promise.resolve(hash === value);
      });

      const sut = await validateSecurityAnswers({
        email: "email",
        questionsWithAssociatedAnswers: [
          {
            questionId: "uuid",
            answer: "answer",
          },
          {
            questionId: "uuid2",
            answer: "answer1.5",
          },
        ],
      });

      expect(sut).toBe(false);
    });

    it("Returns true is given answer values matches what is stored in the database", async () => {
      (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce({
        securityAnswers: [
          {
            id: "uuid",
            question: {
              deprecated: false,
              id: "uuid",
            },
            answer: "answer",
          },
          {
            id: "uuid2",
            question: {
              deprecated: false,
              id: "uuid2",
            },
            answer: "answer2",
          },
        ],
      });

      mockVerifyHash.mockImplementation((hash, value) => {
        return Promise.resolve(hash === value);
      });

      const sut = await validateSecurityAnswers({
        email: "email",
        questionsWithAssociatedAnswers: [
          {
            questionId: "uuid",
            answer: "answer",
          },
          {
            questionId: "uuid2",
            answer: "answer2",
          },
        ],
      });

      expect(sut).toBe(true);
    });

    it("Does sanitize given answers beforehand", async () => {
      (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce({
        securityAnswers: [
          {
            id: "uuid",
            question: {
              deprecated: false,
              id: "uuid",
            },
            answer: "here is my first answer",
          },
          {
            id: "uuid2",
            question: {
              deprecated: false,
              id: "uuid2",
            },
            answer: "here is my second answer",
          },
        ],
      });

      mockVerifyHash.mockImplementation((hash, value) => {
        return Promise.resolve(hash === value);
      });

      const sut = await validateSecurityAnswers({
        email: "email",
        questionsWithAssociatedAnswers: [
          {
            questionId: "uuid",
            answer: "hEre, Is my fiRst! answEr",
          },
          {
            questionId: "uuid2",
            answer: "Here? Is. My Second Answer.",
          },
        ],
      });

      expect(sut).toBe(true);
    });
  });
});
