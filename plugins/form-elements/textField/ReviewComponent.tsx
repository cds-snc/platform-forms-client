import React from "react";
import { BaseElement } from "@clientComponents/forms/Review/FormElements/BaseElement";
import type { ReviewProps } from "../types";

/** Renders the review-page summary for a textField element. */
export const ReviewComponent = ({ formItem }: ReviewProps) => <BaseElement formItem={formItem} />;
