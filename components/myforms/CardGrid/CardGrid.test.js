import React from "react";
import { render, cleanup, screen } from "@testing-library/react";
import { CardGrid } from "@components/myforms/CardGrid/CardGrid";

const cardData_published = {
  id: "1",
  titleEn: "Card TitleEn",
  titleFr: "Card TitleFr",
  url: "/en/myurl",
  date: "Fri Nov 04 2022 10:25:44 GMT-0400 (Eastern Daylight Time)",
  isPublished: true,
};

const cardData_draft = {
  id: "2",
  titleEn: "Card TitleEn",
  titleFr: "Card TitleFr",
  url: "/fr/myurl",
  date: "Fri Nov 04 2022 10:25:44 GMT-0400 (Eastern Daylight Time)",
  isPublished: false,
};

const cardData_published2 = {
  id: "3",
  titleEn: "Card TitleEn",
  titleFr: "Card TitleFr",
  url: "/en/myurl",
  date: "Fri Nov 04 2022 10:25:44 GMT-0400 (Eastern Daylight Time)",
  isPublished: true,
};

const cardsData = [cardData_published, cardData_draft, cardData_published2];

describe("CardGrid component", () => {
  afterEach(cleanup);

  test("renders without errors", () => {
    render(<CardGrid cards={cardsData}></CardGrid>);
    expect(screen.queryByTestId("card-1")).toBeInTheDocument();
    expect(screen.queryByTestId("card-2")).toBeInTheDocument();
    expect(screen.queryByTestId("card-3")).toBeInTheDocument();
  });
});
