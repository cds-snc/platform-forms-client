import React from "react";
import { render, cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Card } from "@components/myforms/Card/Card";

const cardData_published = {
  id: "1",
  titleEn: "Card TitleEn",
  titleFr: "Card TitleFr",
  name: "Card Name",
  url: "/en/myurl",
  date: "Fri Nov 04 2022 10:25:44 GMT-0400 (Eastern Daylight Time)",
  isPublished: true,
};

const cardData_draft = {
  id: "2",
  titleEn: "Card TitleEn",
  titleFr: "Card TitleFr",
  name: "Card Name",
  url: "/fr/myurl",
  date: "Fri Nov 04 2022 10:25:44 GMT-0400 (Eastern Daylight Time)",
  isPublished: false,
};

describe("Card component", () => {
  afterEach(cleanup);

  test("renders without errors", () => {
    render(
      <Card
        id={cardData_published.id}
        titleEn={cardData_published.titleEn}
        titleFr={cardData_published.titleFr}
        url={cardData_published.url}
        date={cardData_published.date}
        isPublished={cardData_published.isPublished}
      ></Card>
    );
    expect(screen.queryByTestId("card-1")).toBeInTheDocument();
  });

  test("renders Published Card content", () => {
    render(
      <Card
        id={cardData_published.id}
        titleEn={cardData_published.titleEn}
        titleFr={cardData_published.titleFr}
        url={cardData_published.url}
        date={cardData_published.date}
        isPublished={cardData_published.isPublished}
      ></Card>
    );

    expect(screen.queryByTestId("card-1")).toBeInTheDocument();
    expect(screen.getByText(/card.states.published/i)).toBeInTheDocument();
    expect(screen.getByText(/Card Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Card TitleFr/i)).toBeInTheDocument();
    expect(screen.getByText(/card.lastEdited: 04\/11\/22/i)).toBeInTheDocument();
    expect(screen.getByText(/card.menu.more/i)).toBeInTheDocument();
  });

  test("renders Draft Card content", () => {
    render(
      <Card
        id={cardData_draft.id}
        titleEn={cardData_draft.titleEn}
        titleFr={cardData_draft.titleFr}
        url={cardData_draft.url}
        date={cardData_draft.date}
        isPublished={cardData_draft.isPublished}
      ></Card>
    );

    expect(screen.queryByTestId("card-2")).toBeInTheDocument();
    expect(screen.getByText(/card.states.draft/i)).toBeInTheDocument();
    expect(screen.getByText(/Card Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Card TitleFr/i)).toBeInTheDocument();
    expect(screen.getByText(/card.lastEdited: 04\/11\/22/i)).toBeInTheDocument();
    expect(screen.getByText(/card.menu.more/i)).toBeInTheDocument();
  });

  test("menu shows on click", async () => {
    render(
      <Card
        id={cardData_published.id}
        titleEn={cardData_published.titleEn}
        titleFr={cardData_published.titleFr}
        url={cardData_published.url}
        date={cardData_published.date}
        isPublished={cardData_published.isPublished}
      ></Card>
    );

    const user = userEvent.setup();
    await user.click(screen.getByText(/card.menu.more/i));
    expect(screen.queryByRole("button", { expanded: "true" }));
  });
});
