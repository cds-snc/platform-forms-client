/**
 * @vitest-environment jsdom
 */
import React from "react";

vi.mock("@i18n/client", () => ({
  __esModule: true,
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en", changeLanguage: async () => undefined },
  }),
}));

vi.mock("@clientComponents/forms/ErrorListItem/ErrorListMessage", () => ({
  __esModule: true,
  ErrorListMessage: ({ defaultValue, id }: { defaultValue: string; id: string }) =>
    React.createElement("span", { "data-testid": `error-message-${id}` }, defaultValue || id),
}));

import { render, screen } from "@testing-library/react";

import { getErrorList } from "@lib/validation/validation";

describe("getErrorList", () => {
  test("Error list renders", () => {
    const props = {
      touched: true,
      errors: {
        1: "input-validation.required",
        2: "input-validation.phone",
      },
      language: "en",
      formRecord: {
        form: {
          layout: [2, 1],
          elements: [
            {
              id: 1,
              type: "textField",
              properties: {
                titleEn: "First question",
                titleFr: "Premiere question",
                validation: { required: true },
              },
            },
            {
              id: 2,
              type: "textField",
              properties: {
                titleEn: "Second question",
                titleFr: "Deuxieme question",
                validation: { required: true },
              },
            },
          ],
        },
      },
    } as never;

    const errors = getErrorList(props);

    expect(errors).not.toBeNull();

    render(errors);

    const list = screen.getByRole("list");
    expect(list).toHaveClass("gc-ordered-list");

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);

    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "#2");
    expect(links[1]).toHaveAttribute("href", "#1");

    expect(items[0]).toHaveTextContent("input-validation.phone");
    expect(items[1]).toHaveTextContent("input-validation.required");
  });

  test("Renders error list in order matching display order", () => {
    const props = {
      touched: true,
      errors: {
        1: "input-validation.required",
        2: "input-validation.phone",
      },
      language: "en",
      formRecord: {
        form: {
          layout: [2, 1],
          elements: [
            {
              id: 1,
              type: "textField",
              properties: {
                titleEn: "First question",
                titleFr: "Premiere question",
                validation: { required: true },
              },
            },
            {
              id: 2,
              type: "textField",
              properties: {
                titleEn: "Second question",
                titleFr: "Deuxieme question",
                validation: { required: true },
              },
            },
          ],
        },
      },
    } as never;

    render(getErrorList(props));

    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["#2", "#1"]);
  });

  test("returns null when there are no matching touched form errors", () => {
    const props = {
      touched: true,
      errors: {
        99: "input-validation.required",
      },
      language: "en",
      formRecord: {
        form: {
          layout: [1],
          elements: [
            {
              id: 1,
              type: "textField",
              properties: {
                titleEn: "Only question",
                titleFr: "Question unique",
                validation: { required: true },
              },
            },
          ],
        },
      },
    } as never;

    expect(getErrorList(props)).toBeNull();
  });
});