import React from "react";
import { cleanup, render, act } from "@testing-library/react";

import { RichText } from "../RichText";
import { store, Wrapper } from "../../../../bootstrap";

jest.mock("next-i18next", () => ({
  useTranslation: () => {
    return {
      t: (str) => str,
      i18n: {
        language: "en",
        changeLanguage: () => Promise.resolve(),
      },
    };
  },
}));

describe("RichText", () => {
  afterEach(cleanup);
  it("renders rich text editor", async () => {
    let rendered = null;
    await act(() => {
      rendered = render(
        <Wrapper form={store.form}>
          <RichText parentIndex={0} />
        </Wrapper>
      );
    });

    const editor = rendered.getByTestId("richText");
    expect(editor.innerHTML).toContain("description 1 en");
  });
});
