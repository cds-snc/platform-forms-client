import React from "react";
import { BaseElement } from "@clientComponents/forms/Review/FormElements/BaseElement";
import type { ReviewProps } from "../types";

export const ReviewComponent = ({ formItem }: ReviewProps) => <BaseElement formItem={formItem} />;
