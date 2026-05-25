import { beforeAll, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { getValuesWithMatchedIds, getVisibleGroupsBasedOnValuesRecursive } from "@gcforms/core";
import {
  type FormElement,
  type FormValues,
  type GroupsType,
  type PublicFormRecord,
} from "@gcforms/types";

import { ReviewList } from "@clientComponents/forms/Review/ReviewList";
import { getReviewItems } from "@clientComponents/forms/Review/helpers";
import { setupFonts } from "../helpers/setupFonts";

const elements: FormElement[] = [
  {
    id: 26,
    type: "radio",
    properties: {
      titleEn: "Would you like to continue with registration?",
      titleFr: "",
      choices: [
        {
          en: "Continue registration",
          fr: "",
        },
        {
          en: "Exit registration",
          fr: "",
        },
      ],
      conditionalRules: [],
      subElements: [],
    },
  },
  {
    id: 30,
    type: "radio",
    properties: {
      titleEn: "Do you currently live in Canada?",
      titleFr: "",
      choices: [
        { en: "Yes", fr: "" },
        { en: "No", fr: "" },
      ],
      conditionalRules: [],
      subElements: [],
    },
  },
  {
    id: 31,
    type: "radio",
    properties: {
      titleEn: "Would you like to join the waiting list if a spot opens up?",
      titleFr: "",
      choices: [
        { en: "Yes", fr: "" },
        { en: "No", fr: "" },
      ],
      conditionalRules: [],
      subElements: [],
    },
  },
  {
    id: 33,
    type: "textField",
    properties: {
      titleEn: "First name",
      titleFr: "",
      choices: [{ en: "", fr: "" }],
      conditionalRules: [],
      subElements: [],
    },
  },
];

const groups: GroupsType = {
  start: {
    name: "Start",
    titleEn: "Start",
    titleFr: "Start",
    autoFlow: false,
    elements: ["26"],
    nextAction: [
      {
        groupId: "exit",
        choiceId: "26.1",
      },
      {
        groupId: "residency",
        choiceId: "26.0",
      },
    ],
  },
  residency: {
    name: "Residency",
    titleEn: "Residency",
    titleFr: "",
    autoFlow: false,
    elements: ["30"],
    nextAction: [
      {
        groupId: "waitingList",
        choiceId: "30.1",
      },
      {
        groupId: "review",
        choiceId: "30.0",
      },
    ],
  },
  waitlistRegistration: {
    name: "Waitlist registration",
    titleEn: "Waitlist registration",
    titleFr: "",
    autoFlow: false,
    elements: ["33"],
    nextAction: "review",
  },
  waitingList: {
    name: "Waiting list",
    titleEn: "Waiting list",
    titleFr: "",
    autoFlow: false,
    elements: ["31"],
    nextAction: [
      {
        groupId: "exit",
        choiceId: "26.1",
      },
      {
        groupId: "residency",
        choiceId: "26.0",
      },
      {
        groupId: "waitlistRegistration",
        choiceId: "31.0",
      },
      {
        groupId: "review",
        choiceId: "31.1",
      },
    ],
  },
  review: {
    name: "Review",
    titleEn: "Review",
    titleFr: "Review",
    autoFlow: true,
    elements: [],
    nextAction: "end",
  },
  exit: {
    name: "Exit",
    titleEn: "Exit",
    titleFr: "Exit",
    autoFlow: true,
    elements: [],
  },
  end: {
    name: "End",
    titleEn: "Confirmation",
    titleFr: "Confirmation",
    autoFlow: true,
    elements: [],
  },
};

const formRecord: PublicFormRecord = {
  id: "review-list-branch-fixture",
  isPublished: false,
  securityAttribute: "Unclassified",
  form: {
    titleEn: "Branching review fixture",
    titleFr: "",
    layout: [26, 30, 31, 33],
    elements,
    groups,
  },
};

const formValues: FormValues = {
  26: "Continue registration",
  30: "No",
  31: "Yes",
  33: "Taylor",
  currentGroup: "review",
  groupHistory: ["start", "residency", "waitingList", "waitlistRegistration", "review"],
  matchedIds: ["31.0", "30.1", "26.0"],
};

describe("<ReviewList />", () => {
  beforeAll(() => {
    setupFonts();
  });

  it("renders the review flow for the non-Canadian waiting-list path", async () => {
    // Some older saved templates kept buggy stale rules from an earlier page/question.
    // In this fixture, the waiting-list page stores both 26.x rules from the start page and
    // 31.x rules from its own page. The old walk matched 26.0 first, jumped back to residency,
    // and left out the first-name answer from the review page.
    const valuesWithMatchedIds = getValuesWithMatchedIds(formRecord.form.elements, formValues);
    const groupHistoryIds = getVisibleGroupsBasedOnValuesRecursive(
      formRecord,
      valuesWithMatchedIds,
      "start"
    );

    const reviewItems = getReviewItems({
      formRecord,
      formValues,
      groups,
      groupHistoryIds,
      language: "en",
    });

    await render(
      <ReviewList language="en" reviewItems={reviewItems} startSectionTitle="Start" />
    );

    await expect
      .element(
        page.getByRole("heading", {
          level: 3,
          name: "Start",
        })
      )
      .toBeVisible();

    await expect.element(page.getByText(/Would you like to continue with registration/i)).toBeVisible();
    await expect.element(page.getByText(/Do you currently live in Canada/i)).toBeVisible();
    await expect
      .element(page.getByText(/Would you like to join the waiting list if a spot opens up/i))
      .toBeVisible();
    await expect.element(page.getByText("First name")).toBeVisible();

    await expect.element(page.getByText("Continue registration")).toBeVisible();
    await expect.element(page.getByText(/^No$/)).toBeVisible();
    await expect.element(page.getByText(/^Yes$/)).toBeVisible();
    await expect.element(page.getByText("Taylor")).toBeVisible();
  });
});