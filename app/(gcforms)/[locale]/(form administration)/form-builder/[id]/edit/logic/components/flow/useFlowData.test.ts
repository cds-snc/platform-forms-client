import { describe, expect, it } from "vitest";
import type { Edge, Node } from "@xyflow/react";

import { layoutPageNodes } from "./useFlowData";

const page = (id: string) =>
  ({
    id,
    position: { x: 0, y: 0 },
    data: { label: { name: id } },
    style: { width: 260, height: 144 },
  }) as Node<Record<string, unknown>>;

const edge = (source: string, target: string) => ({ id: `${source}-${target}`, source, target });

const layout = (ids: string[], links: Array<[string, string]>) => {
  const nodes = [...ids.map(page), page("end")];
  const edges = links.map(([source, target]) => edge(source, target)) as Edge[];
  return layoutPageNodes(nodes, edges);
};

describe("layoutPageNodes with cyclic routing", () => {
  it("lays out a loop reached from start", () => {
    const result = layout(
      ["start", "page1", "page2", "page3"],
      [
        ["start", "page1"],
        ["page1", "page2"],
        ["page2", "page3"],
        ["page3", "page1"],
      ]
    );

    expect(result.map((node) => node.id)).toEqual(["start", "page1", "page2", "page3", "end"]);
    const x = (id: string) => result.find((node) => node.id === id)?.position.x as number;
    expect(x("page1")).toBeGreaterThan(x("start"));
    expect(x("page2")).toBeGreaterThan(x("page1"));
    expect(x("page3")).toBeGreaterThan(x("page2"));
  });

  it("does not throw when a later incoming edge closes the loop first in edge order", () => {
    expect(() =>
      layout(
        ["start", "a", "b", "c"],
        [
          ["c", "a"],
          ["a", "b"],
          ["b", "c"],
          ["start", "a"],
        ]
      )
    ).not.toThrow();
  });

  it("does not throw for a loop that cannot be reached from start", () => {
    expect(() =>
      layout(
        ["start", "a", "b"],
        [
          ["a", "b"],
          ["b", "a"],
        ]
      )
    ).not.toThrow();
  });
});
