/**
 * This code is based on an example from the React Flow Pro.
 * Source: https://pro.reactflow.dev/examples/react/auto-layout
 * Oss plan - https://www.xyflow.com/open-source
 */

import { Position } from "reactflow";
import { Direction } from "./algorithms";

export function getSourceHandlePosition(direction: Direction) {
  switch (direction) {
    case "TB":
      return Position.Bottom;
    case "BT":
      return Position.Top;
    case "LR":
      return Position.Right;
    case "RL":
      return Position.Left;
  }
}

export function getTargetHandlePosition(direction: Direction) {
  switch (direction) {
    case "TB":
      return Position.Top;
    case "BT":
      return Position.Bottom;
    case "LR":
      return Position.Left;
    case "RL":
      return Position.Right;
  }
}
