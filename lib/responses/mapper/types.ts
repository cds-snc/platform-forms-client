export type MappedAnswer = {
  type: string;
  questionId: number;
  questionEn?: string;
  questionFr?: string;
  answer: string | MappedAnswer[][];
};
