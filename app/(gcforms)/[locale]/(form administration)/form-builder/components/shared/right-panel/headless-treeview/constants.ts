// Tree level constants for better readability across handlers
export const TREE_LEVELS = {
  ROOT: -1,
  GROUP: 0,
  ELEMENT: 1,
  SUB_ELEMENT: 2,
} as const;

// Type for tree levels
export type TreeLevel = (typeof TREE_LEVELS)[keyof typeof TREE_LEVELS];

// Helper to check if a value is a valid tree level
export const isValidTreeLevel = (level: number): level is TreeLevel => {
  return Object.values(TREE_LEVELS).includes(level as TreeLevel);
};
