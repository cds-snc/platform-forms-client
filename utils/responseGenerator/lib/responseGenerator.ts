import { LoremIpsum } from "lorem-ipsum";
import { v4 as uuid } from "uuid";
import { md5 } from "hash-wasm";
import fs from "node:fs/promises";
import path from "node:path";

interface Question {
  id: string;
  type: string;
  properties: {
    subElements: Array<Question>;
    choices: { en: string; fr: string }[];
    validation?: {
      required: boolean;
      all?: boolean;
      type?: string;
    };
    maxNumberOfRows?: number;
  };
}

// load test files and create checksums

export type TestFile = {
  name: string;
  size: number;
  content: Buffer<ArrayBufferLike>;
  checksum: string;
};

const testFilesPath = "./test_files";
const testFiles: TestFile[] = [];

export const loadFiles = async () => {
  // Empty existing files in memory
  testFiles.splice(0);

  const filePaths = await fs.readdir(testFilesPath);
  const files = await Promise.all(
    filePaths.map(async (fileName) => {
      const data = await fs.readFile(path.resolve(testFilesPath, fileName));
      return {
        name: fileName,
        size: data.byteLength,
        content: data,
        checksum: await md5(data),
      };
    })
  );
  testFiles.push(...files);
};

const lorem = new LoremIpsum(
  {
    sentencesPerParagraph: {
      max: 8,
      min: 4,
    },
    wordsPerSentence: {
      max: 16,
      min: 4,
    },
  },
  "plain"
);

export function getRandomInt(max: number, min = 0) {
  const range = max - min;
  return Math.floor(Math.random() * range) + min;
}

export const generateResponseForQuestion = (
  language: "en" | "fr",
  question: Question,
  submission: Record<string, unknown>,
  fileRefs: Record<string, TestFile>
) => {
  // For each element in the form template, generate a response
  /*
  "fileInput",        
  */
  let val;

  switch (question.type) {
    case "textField":
      switch (question.properties.validation?.type) {
        case "date":
          val = `${getRandomInt(2037, 1920)}/${getRandomInt(12, 1)}/${getRandomInt(28, 1)}`;
          break;
        case "phone":
          val = `${getRandomInt(999, 100)}-${getRandomInt(999, 100)}-${getRandomInt(9999, 1000)}`;
          break;
        case "name":
          val = lorem.generateWords(1);
          break;
        case "email":
          val = `${lorem.generateWords(1)}@${lorem.generateWords(1)}.ca`;
          break;
        case "alphanumeric":
          val = `${getRandomInt(9999, 1)} ${lorem.generateWords(1)}`;
          break;
        case "number":
          val = `${getRandomInt(500, 1)}`;
          break;
        default:
          val = lorem.generateSentences(1);
          break;
      }
      break;
    case "textArea":
      val = lorem.generateParagraphs(1);
      break;
    case "formattedDate":
      val = {
        YYYY: getRandomInt(2037, 1920),
        MM: getRandomInt(12, 1),
        DD: getRandomInt(28, 1),
      };
      break;
    case "dropdown":
    case "radio":
    case "combobox":
      // single values only
      const randomChoice = getRandomInt(question.properties.choices.length - 1);
      val = question.properties.choices[randomChoice][language];
      break;
    case "checkbox":
      // multiple values possible
      const numberOfCheckedBoxes = question.properties.validation?.all
        ? question.properties.choices.length
        : getRandomInt(question.properties.choices.length, 1);
      // Copy the array so we don't mutate the original
      const choicesArray = [...question.properties.choices];

      val = new Array(numberOfCheckedBoxes).fill(0).map(() => {
        // get a choice from available choices and remove it from the array so it can't be selected twice
        const selection = choicesArray.splice(getRandomInt(choicesArray.length - 1), 1)[0];

        return selection[language];
      });
      break;

    case "dynamicRow":
      const numberOfRows = getRandomInt(question.properties.maxNumberOfRows ?? 10);
      val = new Array(numberOfRows).fill(0).map(() => {
        const subElementResponses: Record<string, unknown> = {};
        question.properties.subElements.forEach((subQuestion) => {
          generateResponseForQuestion(language, subQuestion, subElementResponses, fileRefs);
        });
        return subElementResponses;
      });
      break;

    case "fileInput":
      const fileId = uuid();
      // Stored as a memory reference so all the fileRefs across all responses point to the same file
      // content in mem
      const randomFile = testFiles[getRandomInt(testFiles.length - 1)];
      fileRefs[fileId] = randomFile;

      val = {
        id: fileId,
        name: randomFile.name,
        size: randomFile.size,
      };
      break;
    // Ignore as they do not accept responses
    case "richText":
      break;

    default:
      throw new Error("Unsupported question type");
  }
  submission[question.id] = val;
};
