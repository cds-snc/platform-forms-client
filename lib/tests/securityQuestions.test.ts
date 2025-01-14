/* eslint-disable @typescript-eslint/no-explicit-any */

import { prismaMock } from "@jestUtils";
import {
  createSecurityAnswers,
  updateSecurityAnswer,
  AlreadyHasSecurityAnswers,
  InvalidSecurityQuestionId,
  DuplicatedQuestionsNotAllowed,
  SecurityAnswersNotFound,
} from "@lib/auth/securityQuestions";
import { mockAuthorizationPass } from "__utils__/authorization";

jest.mock("@lib/privileges");
const userId = "1";
mockAuthorizationPass(userId);

describe("Create Security Questions", () => {
  it("Allows a user to create their security questions", async () => {
    //_retrieveUserSecurityAnswers
    (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      securityAnswers: [],
    });

    // retrivePoolOfSecurityQuestions
    (prismaMock.securityQuestion.findMany as jest.MockedFunction<any>).mockResolvedValue([
      { id: "10", questionEn: "question", questionFr: "question", deprecated: false },
    ]);

    const userUpdate = (prismaMock.user.update as jest.MockedFunction<any>).mockResolvedValue({});

    await createSecurityAnswers([{ questionId: "10", answer: "answer" }]);
    expect(userUpdate).toHaveBeenCalledTimes(1);
    expect(userUpdate).toHaveBeenCalledWith({
      where: { id: userId },
      data: {
        securityAnswers: {
          create: [
            {
              question: { connect: { id: "10" } },
              answer: expect.any(String),
            },
          ],
        },
      },
    });
  });
  it("Throws an error if the user already has security questions", async () => {
    //_retrieveUserSecurityAnswers
    (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      securityAnswers: [
        {
          id: "1",
          answer: "answer",
          question: { id: "10", questionEn: "question", questionFr: "question", deprecated: false },
        },
      ],
    });
    await expect(async () => {
      await createSecurityAnswers([{ questionId: "10", answer: "answer" }]);
    }).rejects.toThrow(new AlreadyHasSecurityAnswers());
  });
  it("Throws an error if the user tries to create security questions with invalid question ids", async () => {
    //_retrieveUserSecurityAnswers
    (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      securityAnswers: [],
    });

    // retrivePoolOfSecurityQuestions
    (prismaMock.securityQuestion.findMany as jest.MockedFunction<any>).mockResolvedValue([
      { id: "9", questionEn: "question", questionFr: "question", deprecated: false },
    ]);

    const userUpdate = (prismaMock.user.update as jest.MockedFunction<any>).mockResolvedValue({});
    await expect(async () => {
      await createSecurityAnswers([{ questionId: "10", answer: "answer" }]);
    }).rejects.toThrow(new InvalidSecurityQuestionId());

    expect(userUpdate).toHaveBeenCalledTimes(0);
  });
  it("Throws and error if the user tries to create security questions with duplicated question ids", async () => {
    //_retrieveUserSecurityAnswers
    (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      securityAnswers: [],
    });

    // retrivePoolOfSecurityQuestions
    (prismaMock.securityQuestion.findMany as jest.MockedFunction<any>).mockResolvedValue([
      { id: "10", questionEn: "question", questionFr: "question", deprecated: false },
    ]);

    const userUpdate = (prismaMock.user.update as jest.MockedFunction<any>).mockResolvedValue({});
    await expect(async () => {
      await createSecurityAnswers([
        { questionId: "10", answer: "answer" },
        { questionId: "10", answer: "answer" },
      ]);
    }).rejects.toThrow(new DuplicatedQuestionsNotAllowed());
    expect(userUpdate).toHaveBeenCalledTimes(0);
  });
});
describe("Update Security Questions", () => {
  it("Allows a user to update their security questions", async () => {
    //_retrieveUserSecurityAnswers
    (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      securityAnswers: [
        {
          id: "1",
          answer: "answer",
          question: { id: "10", questionEn: "question", questionFr: "question", deprecated: false },
        },
      ],
    });

    // retrivePoolOfSecurityQuestions
    (prismaMock.securityQuestion.findMany as jest.MockedFunction<any>).mockResolvedValue([
      { id: "10", questionEn: "question", questionFr: "question", deprecated: false },
    ]);

    const securityAnswerUpdate = (
      prismaMock.securityAnswer.update as jest.MockedFunction<any>
    ).mockResolvedValue({});

    await updateSecurityAnswer({
      oldQuestionId: "10",
      newQuestionId: "10",
      newAnswer: "answer",
    });
    expect(securityAnswerUpdate).toHaveBeenCalledTimes(1);
    expect(securityAnswerUpdate).toHaveBeenCalledWith({
      where: { id: "1" },
      data: {
        question: { connect: { id: "10" } },
        answer: expect.any(String),
      },
    });
  });
  it("Allows a user to change their security questions", async () => {
    //_retrieveUserSecurityAnswers
    (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      securityAnswers: [
        {
          id: "1",
          answer: "answer",
          question: { id: "10", questionEn: "question", questionFr: "question", deprecated: false },
        },
      ],
    });

    // retrivePoolOfSecurityQuestions
    (prismaMock.securityQuestion.findMany as jest.MockedFunction<any>).mockResolvedValue([
      { id: "10", questionEn: "question", questionFr: "question", deprecated: false },
      { id: "9", questionEn: "question", questionFr: "question", deprecated: false },
    ]);

    const securityAnswerUpdate = (
      prismaMock.securityAnswer.update as jest.MockedFunction<any>
    ).mockResolvedValue({});

    await updateSecurityAnswer({
      oldQuestionId: "10",
      newQuestionId: "9",
      newAnswer: "answer",
    });
    expect(securityAnswerUpdate).toHaveBeenCalledTimes(1);
    expect(securityAnswerUpdate).toHaveBeenCalledWith({
      where: { id: "1" },
      data: {
        question: { connect: { id: "9" } },
        answer: expect.any(String),
      },
    });
  });
  it("Throws an error if securityQuestions are not yet set", async () => {
    //_retrieveUserSecurityAnswers
    (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      securityAnswers: [],
    });

    // retrivePoolOfSecurityQuestions
    (prismaMock.securityQuestion.findMany as jest.MockedFunction<any>).mockResolvedValue([
      { id: "10", questionEn: "question", questionFr: "question", deprecated: false },
    ]);

    const userUpdate = (
      prismaMock.securityAnswer.update as jest.MockedFunction<any>
    ).mockResolvedValue({});

    await expect(async () => {
      await updateSecurityAnswer({
        oldQuestionId: "10",
        newQuestionId: "10",
        newAnswer: "answer",
      });
    }).rejects.toThrow(new SecurityAnswersNotFound());
    expect(userUpdate).toHaveBeenCalledTimes(0);
  });
  it("Throws an error if the user tries to update security questions with invalid question ids", async () => {
    //_retrieveUserSecurityAnswers
    (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      securityAnswers: [
        {
          id: "1",
          answer: "answer",
          question: { id: "10", questionEn: "question", questionFr: "question", deprecated: false },
        },
      ],
    });

    // retrivePoolOfSecurityQuestions
    (prismaMock.securityQuestion.findMany as jest.MockedFunction<any>).mockResolvedValue([
      { id: "10", questionEn: "question", questionFr: "question", deprecated: false },
      { id: "9", questionEn: "question", questionFr: "question", deprecated: false },
    ]);

    await expect(async () => {
      await updateSecurityAnswer({
        oldQuestionId: "9",
        newQuestionId: "6",
        newAnswer: "answer",
      });
    }).rejects.toThrow(new InvalidSecurityQuestionId());
  });
  it("Throws an error if the user tries to create security questions with duplicated question ids", async () => {
    //_retrieveUserSecurityAnswers
    (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      securityAnswers: [
        {
          id: "1",
          answer: "answer",
          question: { id: "9", questionEn: "question", questionFr: "question", deprecated: false },
        },
        {
          id: "2",
          answer: "answer",
          question: { id: "10", questionEn: "question", questionFr: "question", deprecated: false },
        },
      ],
    });

    // retrivePoolOfSecurityQuestions
    (prismaMock.securityQuestion.findMany as jest.MockedFunction<any>).mockResolvedValue([
      { id: "9", questionEn: "question", questionFr: "question", deprecated: false },
      { id: "10", questionEn: "question", questionFr: "question", deprecated: false },
    ]);

    const userUpdate = (prismaMock.user.update as jest.MockedFunction<any>).mockResolvedValue({});
    await expect(async () => {
      await updateSecurityAnswer({
        oldQuestionId: "9",
        newQuestionId: "10",
        newAnswer: "answer",
      });
    }).rejects.toThrow(new DuplicatedQuestionsNotAllowed());
    expect(userUpdate).toHaveBeenCalledTimes(0);
  });
});
