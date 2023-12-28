import React from "react";
import { Text } from "./Text";
export const Number = ({ title, description }: { title: string; description: string }) => {
  return (
    <div>
      <Text label={title} description={description} value="123456789" />
    </div>
  );
};
