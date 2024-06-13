import { type LayoutOptions } from "./useAutoLayout";
import { MarkerType } from "reactflow";

export const edgeOptions = {
  type: "smoothstep",
  markerEnd: { type: MarkerType.ArrowClosed },
  pathOptions: { offset: 20 },
};

export const layoutOptions: LayoutOptions = {
  algorithm: "d3-hierarchy",
  direction: "LR",
  spacing: [25, 25],
};
