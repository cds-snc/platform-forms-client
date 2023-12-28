import React from "react";
import { Text } from "./Text";
export const Phone = ({ title, description }: { title: string; description: string }) => {
  return (
    <div>
      <Text label={title} description={description} value="000-000-000" />
    </div>
  );
};
