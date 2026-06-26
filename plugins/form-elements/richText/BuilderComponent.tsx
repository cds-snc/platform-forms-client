"use client";
import React from "react";
import { BuilderEditor } from "./BuilderEditor";
import type { BuilderProps } from "../types";

export const BuilderComponent = ({ item }: BuilderProps) => (
  <BuilderEditor id={item.id} elIndex={item.index} />
);
