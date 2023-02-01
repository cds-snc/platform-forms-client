import React from "react";
import { Text } from "./Text";
export const Date = ({ title, description }: { title: string; description: string }) => {
  return (
    <div>
      <Text label={title} description={description} value="00/00/00" />
    </div>
  );
};
