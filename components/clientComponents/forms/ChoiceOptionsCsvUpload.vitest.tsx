/**
 * @vitest-environment jsdom
 */
import { beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  ChoiceOptionsCsvUpload,
  parseChoiceOptionsCsv,
  stringifyChoiceOptionsCsv,
} from "./ChoiceOptionsCsvUpload";
import { MAX_CHOICE_AMOUNT } from "@root/constants";

vi.mock("@i18n/client", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "true");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  });
});

describe("parseChoiceOptionsCsv", () => {
  it("parses csv rows and skips an en,fr header", () => {
    expect(parseChoiceOptionsCsv("en,fr\nFirst,Premier\nSecond,Deuxieme")).toEqual([
      { en: "First", fr: "Premier" },
      { en: "Second", fr: "Deuxieme" },
    ]);
  });

  it("supports quoted values with commas", () => {
    expect(parseChoiceOptionsCsv('"First, option","Premiere, option"')).toEqual([
      { en: "First, option", fr: "Premiere, option" },
    ]);
  });

  it("throws when a row is missing english or french values", () => {
    expect(() => parseChoiceOptionsCsv("Only English,")).toThrow("invalid-columns");
  });

  it("throws when the csv exceeds the maximum number of choices", () => {
    const rows = Array.from(
      { length: MAX_CHOICE_AMOUNT + 1 },
      (_, index) => `English ${index},French ${index}`
    ).join("\n");

    expect(() => parseChoiceOptionsCsv(rows)).toThrow("too-many-rows");
  });

  it("stringifies choices into the upload csv format", () => {
    expect(
      stringifyChoiceOptionsCsv([
        { en: "First", fr: "Premier" },
        { en: "Second, with comma", fr: 'Deuxieme "quoted" value' },
      ])
    ).toBe('en,fr\nFirst,Premier\n"Second, with comma","Deuxieme ""quoted"" value"');
  });
});

describe("ChoiceOptionsCsvUpload", () => {
  it("returns focus to the upload button when the dialog is cancelled", async () => {
    const user = userEvent.setup();

    render(<ChoiceOptionsCsvUpload id="choice-options" onImport={vi.fn()} />);

    const uploadButton = screen.getByTestId("choice-options-upload-csv-trigger");

    await user.click(uploadButton);
    await user.click(screen.getByTestId("choice-options-cancel-upload-csv"));

    await waitFor(() => {
      expect(uploadButton).toHaveFocus();
    });
  });
});
