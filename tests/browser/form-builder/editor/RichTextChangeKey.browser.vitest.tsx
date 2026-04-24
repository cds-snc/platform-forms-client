import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RichText } from "@root/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/edit/components/elements/RichText";

const { storeState } = vi.hoisted(() => ({
  storeState: {
    translationLanguagePriority: "en",
    localizeField: () => "descriptionEn",
    form: {},
    propertyPath: () => "form.elements[1].descriptionEn",
    changeKey: "alpha",
    lang: "en",
    content: "Alpha",
    updateField: vi.fn(),
    getLocalizationAttribute: () => ({ lang: "en" }),
  },
}));

vi.mock("@lib/store/useTemplateStore", () => ({
  useTemplateStore: (selector: (state: typeof storeState) => unknown) => selector(storeState),
}));

vi.mock("@lib/utils/form-builder/getPath", () => ({
  getPath: () => ({
    properties: {
      descriptionEn: storeState.content,
    },
  }),
}));

vi.mock("@i18n/client", () => ({
  useTranslation: () => ({
    t: (value: string) => value,
    i18n: {
      language: "en",
    },
  }),
}));

vi.mock(
  "@formBuilder/components/shared/right-panel/headless-treeview/provider/TreeRefProvider",
  () => ({
    useTreeRef: () => ({
      headlessTree: { current: null },
    }),
  })
);

describe("<RichText /> changeKey remount", () => {
  beforeEach(() => {
    storeState.changeKey = "alpha";
    storeState.content = "Alpha";
  });

  it("reloads editor content after changeKey changes", async () => {
    const view = render(
      <div className="form-builder">
        <RichText id={1} elIndex={0} />
      </div>
    );

    expect(screen.getByText("Alpha")).toBeInTheDocument();

    storeState.content = "Beta";
    storeState.changeKey = "beta";

    view.rerender(
      <div className="form-builder">
        <RichText id={1} elIndex={0} />
      </div>
    );

    await waitFor(() => {
      expect(screen.getByText("Beta")).toBeInTheDocument();
    });
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
  });
});
