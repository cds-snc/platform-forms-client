import React, { useCallback, useState, useRef } from "react";
import { Card, CardProps } from "@components/myforms/Card/Card";
import { ConfirmDelete } from "@components/form-builder/app/ConfirmDelete";
import { useRefresh } from "@lib/hooks";

interface CardGridProps {
  cards: Array<CardProps>;
}

export const CardGrid = (props: CardGridProps): React.ReactElement => {
  const { cards } = props;
  const activeCard = useRef<CardProps | null>(null);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const { refreshData } = useRefresh(cards);

  const handleDelete = useCallback((card: CardProps) => {
    setShowConfirm(true);
    activeCard.current = card;
  }, []);

  return (
    <>
      <ol
        className="grid gap-4 p-0"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(20rem, 1fr))" }}
      >
        {cards &&
          cards?.length > 0 &&
          cards.map((card: CardProps) => {
            return (
              <li className="flex flex-col" key={`card-${card.id}`}>
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
        onDeleted={() => {
          setShowConfirm(false);
          refreshData();
        }}
        show={showConfirm}
        id={activeCard.current?.id || ""}
        isPublished={activeCard.current?.isPublished || false}
        handleClose={setShowConfirm}
      />
    </>
  );
};
