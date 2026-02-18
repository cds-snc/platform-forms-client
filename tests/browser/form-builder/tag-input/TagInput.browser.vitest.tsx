import { describe, it, expect, vi, beforeAll } from "vitest";
import { page, userEvent } from "@vitest/browser/context";
import { TagInput } from "@root/packages/tag-input/src/TagInput";
import { render } from "../testUtils";
import { setupFonts } from "../../helpers/setupFonts";

import "@root/styles/app.scss";

describe("<TagInput />", () => {
  beforeAll(() => {
    setupFonts();
  });

  it("renders without crashing", async () => {
    await render(
      <div>
        <TagInput initialTags={[]} />
      </div>
    );

    const input = page.getByTestId("tag-input");
    await expect.element(input).toBeVisible();
  });

  it("accepts initial tags", async () => {
    await render(
      <div>
        <TagInput
          initialTags={["Tag one", "Tag two", "Tag three"]}
          onTagAdd={() => {}}
          onTagRemove={() => {}}
        />
      </div>
    );

    const tags = document.querySelectorAll(".gc-tag");
    expect(tags.length).toBe(3);

    const tagOne = page.getByText("Tag one");
    await expect.element(tagOne).toBeVisible();
    const tagTwo = page.getByText("Tag two");
    await expect.element(tagTwo).toBeVisible();
    const tagThree = page.getByText("Tag three");
    await expect.element(tagThree).toBeVisible();
  });

  it("sets the name attribute", async () => {
    await render(
      <div>
        <TagInput initialTags={[]} name="test-name" />
      </div>
    );

    const input = page.getByTestId("tag-input");
    await expect.element(input).toHaveAttribute("name", "test-name");
  });

  it("adds a custom label", async () => {
    await render(
      <div>
        <TagInput initialTags={[]} label="Custom Label" />
      </div>
    );

    const label = document.querySelector(".gc-tag-input-label");
    expect(label?.textContent).toContain("Custom Label");
  });

  it("adds a custom description", async () => {
    await render(
      <div>
        <TagInput initialTags={[]} description="Custom Description" />
      </div>
    );

    const description = document.querySelector(".gc-tag-input-description");
    expect(description?.textContent).toContain("Custom Description");
  });

  it("adds a tag", async () => {
    await render(
      <div>
        <TagInput initialTags={[]} />
      </div>
    );

    const input = page.getByTestId("tag-input");
    await input.fill("New Tag");
    await userEvent.keyboard("{Enter}");

    const tags = document.querySelectorAll(".gc-tag");
    expect(tags.length).toBe(1);
    expect(tags[0].textContent).toContain("New Tag");
  });

  it("announces that a tag was added", async () => {
    await render(
      <div>
        <TagInput initialTags={[]} />
      </div>
    );

    const input = page.getByTestId("tag-input");
    await input.fill("New Tag");
    await userEvent.keyboard("{Enter}");

    const liveRegion = document.querySelector("#tag-input-live-region");
    expect(liveRegion).toBeTruthy();
    expect(liveRegion?.textContent).toContain('Tag "New Tag" added');
  });

  it("restricts duplicates", async () => {
    await render(
      <div>
        <TagInput initialTags={["Tag 1"]} restrictDuplicates={true} />
      </div>
    );

    const input = page.getByTestId("tag-input");
    await input.fill("Tag 1");
    await userEvent.keyboard("{Enter}");

    const tags = document.querySelectorAll(".gc-tag");
    expect(tags.length).toBe(1);
  });

  it("announces that a duplicate tag was added", async () => {
    await render(
      <div>
        <TagInput restrictDuplicates={true} />
      </div>
    );

    const input = page.getByTestId("tag-input");
    await input.fill("Tag 1");
    await userEvent.keyboard("{Enter}");
    await input.fill("Tag 1");
    await userEvent.keyboard("{Enter}");

    const liveRegion = document.querySelector("#tag-input-live-region");
    expect(liveRegion).toBeTruthy();
    expect(liveRegion?.textContent).toContain('"Tag 1" is a duplicate tag');
  });

  it("allows duplicates", async () => {
    await render(
      <div>
        <TagInput initialTags={["Tag 1"]} restrictDuplicates={false} />
      </div>
    );

    const input = page.getByTestId("tag-input");
    await input.fill("Tag 1");
    await userEvent.keyboard("{Enter}");

    const tags = document.querySelectorAll(".gc-tag");
    expect(tags.length).toBe(2);
  });

  it("removes a tag", async () => {
    const onTagRemove = vi.fn();

    await render(
      <div>
        <TagInput initialTags={["Tag 1", "Tag 2"]} onTagAdd={() => {}} onTagRemove={onTagRemove} />
      </div>
    );

    const tag2 = page.getByText("Tag 2");
    await expect.element(tag2).toBeVisible();
    const tag1 = page.getByText("Tag 1");
    await expect.element(tag1).toBeVisible();

    const removeButton = document.querySelector("#tag-0 button") as HTMLButtonElement;
    removeButton.click();

    // Wait for tag to be removed
    await page.getByText("Tag 2").query();
    const tags = document.querySelectorAll(".gc-tag");
    expect(tags.length).toBe(1);
    expect(onTagRemove).toHaveBeenCalledWith("Tag 1");
  });

  it("removes a selected tag", async () => {
    await render(
      <div>
        <TagInput initialTags={["one", "two", "three", "four", "five", "six"]} />
      </div>
    );

    const input = page.getByTestId("tag-input");
    await input.element().focus();
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{Delete}");

    const liveRegion = document.querySelector("#tag-input-live-region");
    expect(liveRegion).toBeTruthy();
    expect(liveRegion?.textContent).toContain('Tag "three" removed');

    const tags = document.querySelectorAll(".gc-tag");
    expect(tags.length).toBe(5);
    const tagTexts = Array.from(tags).map(t => t.textContent);
    expect(tagTexts).not.toContain("three");
  });

  it("announces when a tag is removed", async () => {
    await render(
      <div>
        <TagInput initialTags={["Tag 1"]} onTagAdd={() => {}} onTagRemove={() => {}} />
      </div>
    );

    const tag1 = page.getByText("Tag 1");
    await expect.element(tag1).toBeVisible();

    const removeButton = document.querySelector(".gc-tag button") as HTMLButtonElement;
    removeButton.click();

    // Wait for update
    await new Promise(resolve => setTimeout(resolve, 100));

    const liveRegion = document.querySelector("#tag-input-live-region");
    expect(liveRegion).toBeTruthy();
    expect(liveRegion?.textContent).toContain('Tag "Tag 1" removed');
  });

  it("calls onTagAdd handler when adding a tag", async () => {
    const onTagAdd = vi.fn();

    await render(
      <div>
        <TagInput initialTags={[]} onTagAdd={onTagAdd} onTagRemove={() => {}} />
      </div>
    );

    const input = page.getByTestId("tag-input");
    await input.fill("New Tag");
    await userEvent.keyboard("{Enter}");

    const tags = document.querySelectorAll(".gc-tag");
    expect(tags.length).toBe(1);
    expect(tags[0].textContent).toContain("New Tag");
    expect(onTagAdd).toHaveBeenCalledWith("New Tag");
  });

  it("calls onTagRemove handler when removing a tag", async () => {
    const onTagRemove = vi.fn();

    await render(
      <div>
        <TagInput initialTags={["Tag one", "Tag two"]} onTagRemove={onTagRemove} />
      </div>
    );

    const tag1 = page.getByText("Tag one");
    await expect.element(tag1).toBeVisible();

    const removeButton = document.querySelector(".gc-tag button") as HTMLButtonElement;
    removeButton.click();

    // Wait for the tag to be removed by checking the DOM
    await new Promise(resolve => setTimeout(resolve, 100));
    const tags = document.querySelectorAll(".gc-tag");
    expect(tags.length).toBe(1);
    expect(onTagRemove).toHaveBeenCalledWith("Tag one");
  });

  it("validates the tag according to the validation function", async () => {
    const validateTag = (tag: string) => {
      const errors: string[] = [];

      if (tag.length < 3) {
        errors.push("Tag must be at least 3 characters long");
      }

      if (/\d/.test(tag)) {
        errors.push("Tag must not include numbers");
      }

      if (tag.length > 10) {
        errors.push("Tag must be at most 10 characters long");
      }

      return {
        isValid: errors.length === 0,
        errors: errors,
      };
    };

    await render(
      <div>
        <TagInput validateTag={validateTag} />
      </div>
    );

    const input = page.getByTestId("tag-input");

    // Test too short
    await input.fill("ab");
    await userEvent.keyboard("{Enter}");

    let errorDivs = document.querySelectorAll("[data-testid='tag-input-error'] div");
    expect(errorDivs.length).toBe(1);

    const error1 = page.getByTestId("tag-input-error");
    await expect.element(error1).toHaveTextContent("Tag must be at least 3 characters long");

    // Test too long
    await input.fill("abcdefghijklmnopqrstuvwxy");
    await userEvent.keyboard("{Enter}");

    errorDivs = document.querySelectorAll("[data-testid='tag-input-error'] div");
    expect(errorDivs.length).toBe(1);

    const error2 = page.getByTestId("tag-input-error");
    await expect.element(error2).toHaveTextContent("Tag must be at most 10 characters long");

    // Multiple errors
    await input.fill("T1");
    await userEvent.keyboard("{Enter}");

    errorDivs = document.querySelectorAll("[data-testid='tag-input-error'] div");
    expect(errorDivs.length).toBe(2);

    const errorContainer = page.getByTestId("tag-input-error");
    await expect.element(errorContainer).toHaveTextContent("Tag must be at least 3 characters long");
    await expect.element(errorContainer).toHaveTextContent("Tag must not include numbers");
  });
});
