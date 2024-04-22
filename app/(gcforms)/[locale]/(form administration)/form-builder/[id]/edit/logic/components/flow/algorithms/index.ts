/**
 * This code is based on an example from the React Flow Pro.
 * Source: https://pro.reactflow.dev/examples/react/auto-layout
 * Oss plan - https://www.xyflow.com/open-source
 */

import { type Node, type Edge } from "reactflow";

import d3Hierarchy from "./d3-hierarchy";

// the layout direction (T = top, R = right, B = bottom, L = left, TB = top to bottom, ...)
export type Direction = "TB" | "LR" | "RL" | "BT";

export type LayoutAlgorithmOptions = {
  direction: Direction;
  spacing: [number, number];
};

export type LayoutAlgorithm = (
  nodes: Node[],
  edges: Edge[],
  options: LayoutAlgorithmOptions
) => Promise<{ nodes: Node[]; edges: Edge[] }>;

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  "d3-hierarchy": d3Hierarchy,
};
