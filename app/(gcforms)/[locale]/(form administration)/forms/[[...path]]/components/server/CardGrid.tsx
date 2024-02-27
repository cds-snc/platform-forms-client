import React from "react";
import { Card, CardProps } from "./Card";

/* handle delete gets added via the CardGrid component */
type CardWithoutHandleDelete = Omit<CardProps, "handleDelete">;

interface CardGridProps {
  cards: Array<CardWithoutHandleDelete>;
}

export const CardGrid = async ({ cards }: CardGridProps) => {
  return (
    <>
      <ol
        className="grid gap-4 p-0"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(27rem, 1fr))" }}
      >
        {cards &&
          cards?.length > 0 &&
          cards.map((card: CardWithoutHandleDelete) => {
            return (
              <li className="flex flex-col" key={card.id}>
                <Card
                  id={`${card.id}`}
                  name={card.name}
                  titleEn={card.titleEn}
                  titleFr={card.titleFr}
                  url={card.url}
                  date={card.date}
                  isPublished={card.isPublished}
                  deliveryOption={card.deliveryOption || null}
                  overdue={card.overdue}
                  // TODO: remove once add server action to delete a form
                  cards={cards}
                ></Card>
              </li>
            );
          })}
      </ol>
    </>
  );
};
