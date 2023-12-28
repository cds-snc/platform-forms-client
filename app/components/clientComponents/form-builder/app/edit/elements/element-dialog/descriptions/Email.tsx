import React from "react";
import { Text } from "./Text";
export const Email = ({ title, description }: { title: string; description: string }) => {
  return (
    <div>
      <Text label={title} description={description} value="example@email.com" />
    </div>
  );
};
