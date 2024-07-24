import { type LayoutOptions } from "./useAutoLayout";
import { MarkerType } from "reactflow";

export const edgeOptions = {
  type: "simplebezier",
  selectable: false,
  focusable: false,
  animated: true,
  markerEnd: { type: MarkerType.ArrowClosed },
  pathOptions: { offset: 20, type: "straight" },
};

export const layoutOptions: LayoutOptions = {
  algorithm: "d3-hierarchy",
  direction: "LR",
  spacing: [25, 25],
};
