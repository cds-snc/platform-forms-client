import React from "react";
import { ReviewAddressComplete } from "./ReviewAddressComplete";
import type { ReviewProps } from "../types";

export const ReviewComponent = ({ formItem, language }: ReviewProps) => {
  return <ReviewAddressComplete formItem={formItem} language={language} splitValues={true} />;
};
