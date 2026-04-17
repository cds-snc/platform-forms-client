import { diffLines } from "diff";

export type TakeoverDiffSnapshot = {
  before: string;
  after: string;
  createdAt: number;
};

export type TakeoverDiffRow =
  | {
      type: "equal" | "remove" | "add" | "modify";
      leftLineNumber: number | null;
      rightLineNumber: number | null;
      leftText: string;
      rightText: string;
    }
  | {
      type: "skipped";
      count: number;
    };

type DiffOp =
  | { type: "equal"; oldLineNumber: number; newLineNumber: number; text: string }
  | { type: "remove"; oldLineNumber: number; text: string }
  | { type: "add"; newLineNumber: number; text: string };

const STORAGE_KEY_PREFIX = "edit-lock-takeover-diff:";
const MAX_INLINE_DIFF_CHARS = 250_000;
const MAX_INLINE_DIFF_LINES = 2_000;

const splitLines = (value: string) => value.split("\n");
const splitChunkLines = (value: string) => {
  const lines = value.split("\n");
  if (lines.at(-1) === "") {
    lines.pop();
  }
  return lines;
};

const buildDiffOps = (before: string, after: string): DiffOp[] => {
  const ops: DiffOp[] = [];
  let oldLineNumber = 1;
  let newLineNumber = 1;

  diffLines(before, after).forEach((part) => {
    const lines = splitChunkLines(part.value);

    lines.forEach((line) => {
      if (part.added) {
        ops.push({
          type: "add",
          newLineNumber,
          text: line,
        });
        newLineNumber += 1;
        return;
      }

      if (part.removed) {
        ops.push({
          type: "remove",
          oldLineNumber,
          text: line,
        });
        oldLineNumber += 1;
        return;
      }

      ops.push({
        type: "equal",
        oldLineNumber,
        newLineNumber,
        text: line,
      });
      oldLineNumber += 1;
      newLineNumber += 1;
    });
  });

  return ops;
};

const buildRowsFromOps = (ops: DiffOp[]) => {
  const rows: Exclude<TakeoverDiffRow, { type: "skipped"; count: number }>[] = [];

  let index = 0;
  while (index < ops.length) {
    const op = ops[index];
    if (op.type === "equal") {
      rows.push({
        type: "equal",
        leftLineNumber: op.oldLineNumber,
        rightLineNumber: op.newLineNumber,
        leftText: op.text,
        rightText: op.text,
      });
      index += 1;
      continue;
    }

    const removed: Extract<DiffOp, { type: "remove" }>[] = [];
    const added: Extract<DiffOp, { type: "add" }>[] = [];

    while (index < ops.length && ops[index].type !== "equal") {
      const next = ops[index];
      if (next.type === "remove") {
        removed.push(next);
      } else if (next.type === "add") {
        added.push(next);
      }
      index += 1;
    }

    const rowCount = Math.max(removed.length, added.length);
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
      const left = removed[rowIndex];
      const right = added[rowIndex];
      if (left) {
        rows.push({
          type: "remove",
          leftLineNumber: left.oldLineNumber,
          rightLineNumber: null,
          leftText: left.text,
          rightText: "",
        });
      }

      if (right) {
        rows.push({
          type: "add",
          leftLineNumber: null,
          rightLineNumber: right.newLineNumber,
          leftText: "",
          rightText: right.text,
        });
      }
    }
  }

  return rows;
};

export const shouldRenderTakeoverDiffInline = (snapshot: TakeoverDiffSnapshot) => {
  const totalChars = snapshot.before.length + snapshot.after.length;
  const totalLines = splitLines(snapshot.before).length + splitLines(snapshot.after).length;
  return totalChars <= MAX_INLINE_DIFF_CHARS && totalLines <= MAX_INLINE_DIFF_LINES;
};

export const buildTakeoverDiffRows = (
  snapshot: TakeoverDiffSnapshot,
  contextLines = 2
): TakeoverDiffRow[] => {
  const rows = buildRowsFromOps(buildDiffOps(snapshot.before, snapshot.after));
  const changedIndices = rows
    .map((row, index) => (row.type === "equal" ? -1 : index))
    .filter((index) => index >= 0);

  if (changedIndices.length === 0) {
    return [];
  }

  const visible = new Set<number>();
  changedIndices.forEach((index) => {
    const start = Math.max(0, index - contextLines);
    const end = Math.min(rows.length - 1, index + contextLines);
    for (let current = start; current <= end; current += 1) {
      visible.add(current);
    }
  });

  const output: TakeoverDiffRow[] = [];
  let current = 0;
  while (current < rows.length) {
    if (visible.has(current)) {
      output.push(rows[current]);
      current += 1;
      continue;
    }

    let skippedCount = 0;
    while (current < rows.length && !visible.has(current)) {
      skippedCount += 1;
      current += 1;
    }
    output.push({ type: "skipped", count: skippedCount });
  }

  return output;
};

export const getTakeoverDiffStorageKey = (formId: string) => `${STORAGE_KEY_PREFIX}${formId}`;

export const readTakeoverDiffSnapshot = (formId: string): TakeoverDiffSnapshot | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(getTakeoverDiffStorageKey(formId));
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as TakeoverDiffSnapshot;
    if (typeof parsed?.before !== "string" || typeof parsed?.after !== "string") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const writeTakeoverDiffSnapshot = (formId: string, snapshot: TakeoverDiffSnapshot) => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(getTakeoverDiffStorageKey(formId), JSON.stringify(snapshot));
};

export const clearTakeoverDiffSnapshot = (formId: string) => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(getTakeoverDiffStorageKey(formId));
};
