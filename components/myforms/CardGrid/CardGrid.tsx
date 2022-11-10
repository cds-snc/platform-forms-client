import React from "react";
import { useTranslation } from "next-i18next";
import { Card, CardProps } from "@components/myforms/Card/Card";

interface CardGridProps {
  cards: Array<CardProps>;
}

export const CardGrid = (props: CardGridProps): React.ReactElement => {
  const { cards } = props;
  const { t } = useTranslation(["my-forms"]);

  return (
    <ol
      className="grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(20rem, 1fr))" }}
    >
      {cards &&
        cards?.length > 0 &&
        cards.map((card: CardProps, index: number) => {
          return (
            <li className="flex flex-col" key={index}>
              <Card
                id={card.id}
                titleEn={card.titleEn}
                titleFr={card.titleFr}
                url={card.url}
                date={card.date}
                isPublished={card.isPublished}
              ></Card>
            </li>
          );
        })}
      {cards && cards?.length === 0 && <p>{t("cards.noForms")}</p>}
    </ol>
  );
};
