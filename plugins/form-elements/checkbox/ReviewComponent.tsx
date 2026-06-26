import React from "react";
import { BaseElementArray } from "@clientComponents/forms/Review/FormElements/BaseElementArray";
import type { ReviewProps } from "../types";

export const ReviewComponent = ({ formItem }: ReviewProps) => {
  return <BaseElementArray formItem={formItem} splitValues={true} />;
};
