import { BaseEdge, getSmoothStepPath, type EdgeProps, Position } from "@xyflow/react";

const TARGET_MARKER_GAP = 8;

const getAdjustedTarget = (targetX: number, targetY: number, targetPosition?: Position) => {
  switch (targetPosition) {
    case Position.Left:
      return { x: targetX - TARGET_MARKER_GAP, y: targetY };
    case Position.Right:
      return { x: targetX + TARGET_MARKER_GAP, y: targetY };
    case Position.Top:
      return { x: targetX, y: targetY - TARGET_MARKER_GAP };
    case Position.Bottom:
      return { x: targetX, y: targetY + TARGET_MARKER_GAP };
    default:
      return { x: targetX, y: targetY };
  }
};

export const FlowEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
}: EdgeProps) => {
  const adjustedTarget = getAdjustedTarget(targetX, targetY, targetPosition);
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX: adjustedTarget.x,
    targetY: adjustedTarget.y,
    sourcePosition,
    targetPosition,
    offset: 24,
    borderRadius: 18,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
    </>
  );
};
