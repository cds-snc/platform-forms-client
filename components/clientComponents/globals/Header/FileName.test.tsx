/**
 * @vitest-environment jsdom
 */
import { beforeAll, describe, expect, it } from "vitest";
import { render, waitFor, cleanup } from "@testing-library/react";
import i18next from "i18next";

import "@root/i18n/client";

import { FileNameInput } from "./FileName";
import { TemplateStoreProvider } from "@lib/store/useTemplateStore";
import { RefStoreProvider } from "@lib/hooks/form-builder/useRefStore";

const renderComponent = (props?: {
  isPublished?: boolean;
  currentPublishedVersionId?: string | null;
  currentDraftVersionId?: string | null;
  versionNumber?: number | null;
}) => {
  return render(
    <TemplateStoreProvider id="test-form-id" {...props}>
      <RefStoreProvider>
        <FileNameInput />
      </RefStoreProvider>
    </TemplateStoreProvider>
  );
};

describe("<FileNameInput />", () => {
  beforeAll(async () => {
    await i18next.loadNamespaces(["form-builder", "my-forms"]);
  });

  afterEach(() => {
    cleanup();
  });

  it("shows the draft badge when there is an active draft version", async () => {
    renderComponent({ currentDraftVersionId: "draft-version-6", versionNumber: 6 });

    await waitFor(() => {
      const draftBadge = document.querySelector('[data-draft-id="draft-version-6"]');
      expect(draftBadge).toBeInTheDocument();
      expect(draftBadge).toHaveTextContent("6");
    });
  });

  it("hides the draft badge after publish when there is no active draft version", async () => {
    renderComponent({
      isPublished: true,
      currentPublishedVersionId: "published-version-6",
      currentDraftVersionId: null,
      versionNumber: 6,
    });

    await waitFor(() => {
      expect(document.querySelector("[data-draft-id]")).not.toBeInTheDocument();
    });
  });
});
