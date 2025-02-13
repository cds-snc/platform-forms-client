import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { scrypt, randomBytes } from "crypto";
import { authorization } from "@lib/privileges";
import { AccessControlError } from "@lib/auth/errors";
import { logEvent } from "@lib/auditLogs";

export type SecurityQuestionId = string;

export type SecurityQuestion = {
  id: SecurityQuestionId;
  questionEn: string;
  questionFr: string;
  deprecated: boolean;
};

export type UpdateSecurityAnswerCommand = {
  oldQuestionId: SecurityQuestionId;
  newQuestionId: SecurityQuestionId;
  newAnswer: string;
};

export type ValidateSecurityAnswersCommand = {
  email: string;
  questionsWithAssociatedAnswers: { questionId: SecurityQuestionId; answer: string }[];
};

export class AlreadyHasSecurityAnswers extends Error {
  constructor(message?: string) {
    super(message ?? "AlreadyHasSecurityAnswers");
    Object.setPrototypeOf(this, AlreadyHasSecurityAnswers.prototype);
  }
}
export class DuplicatedQuestionsNotAllowed extends Error {
  constructor(message?: string) {
    super(message ?? "DuplicatedQuestionsNotAllowed");
    Object.setPrototypeOf(this, DuplicatedQuestionsNotAllowed.prototype);
  }
}
export class SecurityAnswersNotFound extends Error {
  constructor(message?: string) {
    super(message ?? "SecurityAnswersNotFound");
    Object.setPrototypeOf(this, SecurityAnswersNotFound.prototype);
  }
}
export class SecurityQuestionNotFound extends Error {
  constructor(message?: string) {
    super(message ?? "SecurityQuestionNotFound");
    Object.setPrototypeOf(this, SecurityQuestionNotFound.prototype);
  }
}
export class InvalidSecurityQuestionId extends Error {
  constructor(message?: string) {
    super(message ?? "InvalidSecurityQuestionId");
    Object.setPrototypeOf(this, InvalidSecurityQuestionId.prototype);
  }
}

type SecurityAnswerId = string;

type SecurityAnswer = {
  id: SecurityAnswerId;
  question: SecurityQuestion;
  hashedAnswer: string;
};

class SecurityQuestionDatabaseOperationFailed extends Error {
  constructor(message?: string) {
    super(message ?? "SecurityQuestionDatabaseOperationFailed");
    Object.setPrototypeOf(this, SecurityQuestionDatabaseOperationFailed.prototype);
  }
}

export async function retrievePoolOfSecurityQuestions(): Promise<SecurityQuestion[]> {
  const securityQuestions = await prisma.securityQuestion
    .findMany()
    .catch((e) => prismaErrors(e, []));

  return securityQuestions.map((question) => {
    return {
      id: question.id,
      questionEn: question.questionEn,
      questionFr: question.questionFr,
      deprecated: question.deprecated,
    };
  });
}

export async function createSecurityAnswers(
  questionsWithAssociatedAnswers: { questionId: SecurityQuestionId; answer: string }[]
): Promise<void> {
  const { user } = await authorization.canUpdateSecurityQuestions().catch((e) => {
    if (e instanceof AccessControlError) {
      logEvent(e.user.id, { type: "User" }, "AccessDenied", "Attempted to create security answers");
    }
    throw e;
  });

  const userSecurityAnswers = await _retrieveUserSecurityAnswers({ userId: user.id });
  if (userSecurityAnswers.length > 0) throw new AlreadyHasSecurityAnswers();

  const questionIds = questionsWithAssociatedAnswers.map(
    (questionAnswer) => questionAnswer.questionId
  );

  const areQuestionIdsValidResult = await areQuestionIdsValid(questionIds);
  if (!areQuestionIdsValidResult) throw new InvalidSecurityQuestionId();

  const hasDuplicatedQuestions = questionIds.some((e) => {
    if (questionIds.indexOf(e) !== questionIds.lastIndexOf(e)) return true;
    return false;
  });
  if (hasDuplicatedQuestions) throw new DuplicatedQuestionsNotAllowed();

  const dataPayload = await Promise.all(
    questionsWithAssociatedAnswers.map(async (item) => {
      const sanitizedAnswer = sanitizeAnswer(item.answer);
      return {
        question: { connect: { id: item.questionId } },
        answer: await hashAnswer(sanitizedAnswer),
      };
    })
  );

  const operationResult = await prisma.user
    .update({
      where: {
        id: user.id,
      },
      data: {
        securityAnswers: {
          create: dataPayload,
        },
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (!operationResult) throw new SecurityQuestionDatabaseOperationFailed();
  logEvent(user.id, { type: "User" }, "CreateSecurityAnswers");
}

export async function updateSecurityAnswer(command: UpdateSecurityAnswerCommand): Promise<void> {
  const { user } = await authorization.canUpdateSecurityQuestions().catch((e) => {
    if (e instanceof AccessControlError) {
      logEvent(e.user.id, { type: "User" }, "AccessDenied", "Attempted to update security answers");
    }
    throw e;
  });
  const areQuestionIdsValidResult = await areQuestionIdsValid([command.newQuestionId]);
  if (!areQuestionIdsValidResult) throw new InvalidSecurityQuestionId();

  const userSecurityAnswers = await _retrieveUserSecurityAnswers({ userId: user.id });
  if (userSecurityAnswers.length === 0) throw new SecurityAnswersNotFound();

  const oldAnswer = userSecurityAnswers.find(
    (answer) => answer.question.id === command.oldQuestionId
  );
  if (!oldAnswer) throw new SecurityQuestionNotFound();

  const hasDuplicatedQuestions = userSecurityAnswers
    .filter((e) => e.question.id !== oldAnswer.question.id)
    .map((e) => e.question.id)
    .includes(command.newQuestionId);
  if (hasDuplicatedQuestions) throw new DuplicatedQuestionsNotAllowed();

  const sanitizedAnswer = sanitizeAnswer(command.newAnswer);
  const hashedAnswer = await hashAnswer(sanitizedAnswer);

  const operationResult = await prisma.securityAnswer
    .update({
      where: {
        id: oldAnswer.id,
      },
      data: {
        question: { connect: { id: command.newQuestionId } },
        answer: hashedAnswer,
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (!operationResult) throw new SecurityQuestionDatabaseOperationFailed();
  logEvent(user.id, { type: "User" }, "ChangeSecurityAnswers");
}

export async function retrieveUserSecurityQuestions({
  userId,
  email,
}: {
  userId?: string;
  email?: string;
}): Promise<SecurityQuestion[]> {
  if (!userId && !email) throw new Error("Either userId or email must be provided");

  const securityQuestions = await prisma.user
    .findUnique({
      where: {
        id: userId,
        email: email,
      },
      select: {
        securityAnswers: {
          select: {
            question: {
              select: {
                id: true,
                questionEn: true,
                questionFr: true,
                deprecated: true,
              },
            },
          },
          orderBy: {
            id: "asc",
          },
        },
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (!securityQuestions) throw new SecurityQuestionDatabaseOperationFailed();

  return securityQuestions.securityAnswers.map((answer) => {
    return {
      id: answer.question.id,
      questionEn: answer.question.questionEn,
      questionFr: answer.question.questionFr,
      deprecated: answer.question.deprecated,
    };
  });
}

export async function userHasSecurityQuestions({
  userId,
  email,
}: {
  userId?: string;
  email?: string;
}): Promise<boolean> {
  const numberOfQuestions = await prisma.securityAnswer.count({
    where: {
      user: {
        id: userId,
        email,
      },
    },
  });

  return numberOfQuestions > 0;
}

export async function validateSecurityAnswers(
  command: ValidateSecurityAnswersCommand
): Promise<boolean> {
  const userSecurityAnswers = await _retrieveUserSecurityAnswers({ email: command.email });

  if (userSecurityAnswers.length !== command.questionsWithAssociatedAnswers.length) return false;

  const answerValidationRequests = command.questionsWithAssociatedAnswers.map(
    async (answerToConfirm) => {
      const expectedAnswer = userSecurityAnswers.find(
        (e) => e.question.id.trim() === answerToConfirm.questionId.trim()
      );

      if (!expectedAnswer) return false;

      const sanitizedAnswerToConfirm = sanitizeAnswer(answerToConfirm.answer);
      return verifyAnswer(sanitizedAnswerToConfirm, expectedAnswer.hashedAnswer);
    }
  );

  const answerValidationsResults = await Promise.all(answerValidationRequests);

  return !answerValidationsResults.includes(false);
}

async function _retrieveUserSecurityAnswers({
  userId,
  email,
}: {
  userId?: string;
  email?: string;
}): Promise<SecurityAnswer[]> {
  if (!userId && !email) throw new Error("Either userId or email must be provided");

  const userSecurityAnswers = await prisma.user
    .findUnique({
      where: {
        id: userId,
        email: email,
      },
      select: {
        securityAnswers: {
          select: {
            id: true,
            question: {
              select: {
                id: true,
                questionEn: true,
                questionFr: true,
                deprecated: true,
              },
            },
            answer: true,
          },
          orderBy: {
            id: "asc",
          },
        },
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (!userSecurityAnswers) throw new SecurityQuestionDatabaseOperationFailed();

  return userSecurityAnswers.securityAnswers.map((answer) => {
    return {
      id: answer.id,
      question: {
        id: answer.question.id,
        questionEn: answer.question.questionEn,
        questionFr: answer.question.questionFr,
        deprecated: answer.question.deprecated,
      },
      hashedAnswer: answer.answer,
    };
  });
}

async function areQuestionIdsValid(questionIds: SecurityQuestionId[]): Promise<boolean> {
  const poolOfSecurityQuestions = await retrievePoolOfSecurityQuestions();
  const validSecurityQuestionIds = poolOfSecurityQuestions
    .filter((question) => question.deprecated === false)
    .map((question) => question.id);
  return questionIds.every((questionId) => validSecurityQuestionIds.includes(questionId));
}

function sanitizeAnswer(answer: string): string {
  // Removing punctuation, french accents and capitals
  return answer
    .normalize("NFD")
    .replace(/([\u0300-\u036f]|[^0-9a-zA-Z\s])/g, "")
    .toLowerCase();
}

async function hashAnswer(answer: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(8).toString("hex");
    scrypt(answer, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(salt + ":" + derivedKey.toString("hex"));
    });
  });
}

async function verifyAnswer(answer: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(":");
    scrypt(answer, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(key == derivedKey.toString("hex"));
    });
  });
}
