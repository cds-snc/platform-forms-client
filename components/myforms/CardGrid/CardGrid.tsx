import React, { useCallback } from "react";
import { Card, CardProps } from "@components/myforms/Card/Card";
import { ConfirmDelete } from "@components/form-builder/app/ConfirmDelete";

interface CardGridProps {
  cards: Array<CardProps>;
}

export const CardGrid = (props: CardGridProps): React.ReactElement => {
  const { cards } = props;
  const [activeCard, setActiveCard] = React.useState<CardProps | null>(null);
  const [showConfirm, setShowConfirm] = React.useState<boolean>(false);

  const handleDelete = useCallback((card: CardProps) => {
    setShowConfirm(true);
    setActiveCard(card);
  }, []);

  return (
    <>
      <ol
        className="grid gap-4 p-0"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(20rem, 1fr))" }}
      >
        {cards &&
          cards?.length > 0 &&
          cards.map((card: CardProps, index: number) => {
            return (
              <li className="flex flex-col" key={index}>
                <Card
                  id={card.id}
                  name={card.name}
                  titleEn={card.titleEn}
                  titleFr={card.titleFr}
                  url={card.url}
                  date={card.date}
                  isPublished={card.isPublished}
                  handleDelete={handleDelete}
                ></Card>
              </li>
            );
          })}
      </ol>

      <ConfirmDelete
        show={showConfirm}
        id={activeCard?.id || ""}
        isPublished={activeCard?.isPublished || false}
        handleClose={setShowConfirm}
      />
    </>
  );
};
