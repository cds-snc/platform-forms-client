import { type LayoutOptions } from "./useAutoLayout";
import { MarkerType } from "@xyflow/react";

export const edgeOptions = {
  type: "flowEdge",
  selectable: false,
  focusable: false,
  animated: true,
  markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
};

export const layoutOptions: LayoutOptions = {
  algorithm: "d3-hierarchy",
  direction: "LR",
  spacing: [25, 25],
  showReviewNode: false,
};
