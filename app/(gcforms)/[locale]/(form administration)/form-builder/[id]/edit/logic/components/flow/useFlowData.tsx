import { MarkerType, type Edge, type Node } from "@xyflow/react";
import { stratify, tree } from "d3-hierarchy";
import { LOCKED_GROUPS } from "@formBuilder/components/shared/right-panel/headless-treeview/constants";
import {
  TreeItem,
  TreeItemIndex,
} from "@formBuilder/components/shared/right-panel/headless-treeview/types";
import { type Group } from "@gcforms/types";
import { useGroupStore } from "@lib/groups/useGroupStore";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { FormElement } from "@lib/types";
import { Language } from "@lib/types/form-builder-types";
import {
  getEndNode,
  getReviewNode,
  getStartElements,
  getStartLabels,
} from "@lib/utils/form-builder/i18nHelpers";
import { groupsToTreeData } from "@root/lib/groups/utils/groupsToTreeData";

const LOCKED_SECTIONS = {
  START: LOCKED_GROUPS.START,
  REVIEW: LOCKED_GROUPS.REVIEW,
  END: LOCKED_GROUPS.END,
} as const;

const PAGE_WIDTH = 260;
const PAGE_HEADER_HEIGHT = 48;
const PAGE_CHILD_HEIGHT = 60;
const PAGE_CHILD_GAP = 8;
const PAGE_PADDING = 12;
const PAGE_MIN_HEIGHT = 144;
const OFFBOARD_HEIGHT = 164;
const LAYOUT_SPACING_X = 70;
const LAYOUT_SPACING_Y = 4;

const branchableElementTypes: ReadonlySet<string> = new Set(["radio", "checkbox", "dropdown"]);

type StaticChild = {
  data: string;
  index: string;
};

type FlowElementNodeData = {
  groupId: string;
  elementId?: number;
  hasRules?: boolean;
  label?: string;
};

type LayoutNode = Node<Record<string, unknown>>;

const defaultEdges = {
  end: LOCKED_SECTIONS.END,
} as const;

const mutedLineStyle = {
  strokeWidth: 2,
  stroke: "#94A3B8",
  opacity: 0.9,
  strokeDasharray: "none",
};

const highlightedLineStyle = {
  strokeWidth: 5,
  stroke: "#4338CA",
  strokeDasharray: "none",
};

const arrowStyle = {
  type: MarkerType.ArrowClosed,
};

const getElementNodeId = (groupId: string, elementId: string | number) =>
  `${groupId}::element::${elementId}`;

const isStaticChild = (child: TreeItem | StaticChild): child is StaticChild =>
  !("isFolder" in child);

const getLabelName = (
  treeItem: TreeItem,
  key: TreeItemIndex,
  lang: Language,
  titleKey: "name" | "titleEn" | "titleFr"
) => {
  if (key === LOCKED_SECTIONS.START) {
    return getStartLabels()[lang];
  }

  return (treeItem.data?.[titleKey as keyof typeof treeItem.data] as string) || String(key);
};

const getChoiceLabel = (
  elements: FormElement[],
  choiceId: string,
  lang: Language
): string | undefined => {
  if (choiceId.includes("catch-all")) {
    return lang === "fr" ? "Toutes les autres options" : "All other options";
  }

  const [elementId, choiceIndex] = choiceId.split(".");
  const element = elements.find((item) => item.id === Number(elementId));

  if (!element?.properties?.choices || typeof choiceIndex === "undefined") {
    return undefined;
  }

  return element.properties.choices[Number(choiceIndex)]?.[lang];
};

const isBranchableElement = (element?: FormElement) => {
  return (
    !!element &&
    branchableElementTypes.has(element.type) &&
    (element.properties.choices?.length ?? 0) > 0
  );
};

const getPageHeight = (
  childCount: number,
  minHeight = PAGE_MIN_HEIGHT,
  childHeight = PAGE_CHILD_HEIGHT,
  childGap = PAGE_CHILD_GAP,
  pageHeaderHeight = PAGE_HEADER_HEIGHT,
  pagePadding = PAGE_PADDING
) => {
  if (!childCount) {
    return minHeight;
  }

  return Math.max(
    minHeight,
    pageHeaderHeight + pagePadding * 2 + childCount * childHeight + (childCount - 1) * childGap
  );
};

const rootLayoutNode: LayoutNode = {
  id: "layout-root",
  position: { x: 0, y: 0 },
  data: { label: { name: "" } },
};

const compactPageRows = (nodes: LayoutNode[]) => {
  if (nodes.length <= 1) {
    return nodes;
  }

  const sortedNodes = [...nodes].sort(
    (left, right) => left.position.y - right.position.y || left.position.x - right.position.x
  );
  const compacted = new Map<string, number>();
  const placedNodes: Array<{ x: number; y: number; width: number; height: number }> = [];
  const topY = Math.min(...sortedNodes.map((node) => node.position.y));

  for (const node of sortedNodes) {
    const width = typeof node.style?.width === "number" ? node.style.width : PAGE_WIDTH;
    const height = typeof node.style?.height === "number" ? node.style.height : PAGE_MIN_HEIGHT;
    let candidateY = topY;

    const blockers = placedNodes
      .filter((placedNode) => {
        const leftEdge = node.position.x;
        const rightEdge = node.position.x + width;
        const placedLeftEdge = placedNode.x;
        const placedRightEdge = placedNode.x + placedNode.width;

        return leftEdge < placedRightEdge && rightEdge > placedLeftEdge;
      })
      .sort((left, right) => left.y - right.y);

    for (const blocker of blockers) {
      if (candidateY + height > blocker.y - LAYOUT_SPACING_Y) {
        candidateY = blocker.y + blocker.height + LAYOUT_SPACING_Y;
      }
    }

    compacted.set(node.id, candidateY);
    placedNodes.push({
      x: node.position.x,
      y: candidateY,
      width,
      height,
    });
  }

  return nodes.map((node) => ({
    ...node,
    position: {
      ...node.position,
      y: compacted.get(node.id) ?? node.position.y,
    },
  }));
};

const compactPageColumns = (nodes: LayoutNode[]) => {
  if (nodes.length <= 1) {
    return nodes;
  }

  const columns = new Map<number, LayoutNode[]>();

  for (const node of nodes) {
    const width = typeof node.style?.width === "number" ? node.style.width : PAGE_WIDTH;
    const centerX = Math.round(node.position.x + width / 2);
    const existingColumn = columns.get(centerX) ?? [];

    existingColumn.push(node);
    columns.set(centerX, existingColumn);
  }

  const sortedColumns = [...columns.entries()].sort(
    ([leftCenter], [rightCenter]) => leftCenter - rightCenter
  );
  const compacted = new Map<string, number>();

  let nextX = Math.min(...nodes.map((node) => node.position.x));

  for (const [, columnNodes] of sortedColumns) {
    const columnWidth = columnNodes.reduce((maxWidth, node) => {
      const width = typeof node.style?.width === "number" ? node.style.width : PAGE_WIDTH;
      return Math.max(maxWidth, width);
    }, 0);

    for (const node of columnNodes) {
      const width = typeof node.style?.width === "number" ? node.style.width : PAGE_WIDTH;
      compacted.set(node.id, nextX + (columnWidth - width) / 2);
    }

    nextX += columnWidth + LAYOUT_SPACING_X;
  }

  return nodes.map((node) => ({
    ...node,
    position: {
      ...node.position,
      x: compacted.get(node.id) ?? node.position.x,
    },
  }));
};

const TRAILING_NODE_IDS: ReadonlyArray<string> = [LOCKED_SECTIONS.REVIEW, LOCKED_SECTIONS.END];

const placeTrailingNodes = (nodes: LayoutNode[]) => {
  const trailingNodes = TRAILING_NODE_IDS.map((id) => nodes.find((node) => node.id === id)).filter(
    (node): node is LayoutNode => Boolean(node)
  );

  if (!trailingNodes.length) {
    return nodes;
  }

  const mainNodes = nodes.filter((node) => !TRAILING_NODE_IDS.includes(node.id));
  const startNode = nodes.find((node) => node.id === LOCKED_SECTIONS.START);
  const startY = startNode?.position.y ?? 0;

  // Compute the rightmost edge of all already-laid-out main nodes so we can
  // place the trailing column(s) just past them.
  const rightmostX = mainNodes.reduce((max, node) => {
    const width = typeof node.style?.width === "number" ? node.style.width : PAGE_WIDTH;
    return Math.max(max, node.position.x + width);
  }, Number.NEGATIVE_INFINITY);

  let nextX = Number.isFinite(rightmostX) ? rightmostX + LAYOUT_SPACING_X : 0;
  const trailingPositions = new Map<string, { x: number; y: number }>();

  for (const trailingNode of trailingNodes) {
    const width =
      typeof trailingNode.style?.width === "number" ? trailingNode.style.width : PAGE_WIDTH;
    trailingPositions.set(trailingNode.id, { x: nextX, y: startY });
    nextX += width + LAYOUT_SPACING_X;
  }

  return nodes.map((node) => {
    const trailingPosition = trailingPositions.get(node.id);
    if (!trailingPosition) {
      return node;
    }
    return { ...node, position: trailingPosition };
  });
};

const layoutPageNodes = (nodes: LayoutNode[], edges: Edge[]) => {
  if (!nodes.length) {
    return nodes;
  }

  // Trailing nodes (review / end) are positioned manually after layout so they
  // don't inherit a sibling column from the d3-tree hierarchy when multiple
  // groups feed into them.
  const mainNodes = nodes.filter((node) => !TRAILING_NODE_IDS.includes(node.id));
  const layoutEdges = edges.filter((edge) => !TRAILING_NODE_IDS.includes(edge.target));

  if (!mainNodes.length) {
    return placeTrailingNodes(nodes);
  }

  const maxPageHeight = mainNodes.reduce((maxHeight, node) => {
    const nodeHeight = typeof node.style?.height === "number" ? node.style.height : PAGE_MIN_HEIGHT;
    return Math.max(maxHeight, nodeHeight);
  }, PAGE_MIN_HEIGHT);

  const layoutTree = tree<LayoutNode>()
    .nodeSize([maxPageHeight + LAYOUT_SPACING_Y, PAGE_WIDTH + LAYOUT_SPACING_X])
    .separation(() => 1);

  const hierarchy = stratify<LayoutNode>()
    .id((node) => node.id)
    .parentId((node) => {
      if (node.id === rootLayoutNode.id) {
        return undefined;
      }

      return layoutEdges.find((edge) => edge.target === node.id)?.source || rootLayoutNode.id;
    })([rootLayoutNode, ...mainNodes]);

  const laidOutRoot = layoutTree(hierarchy);
  const positions = new Map<string, { x: number; y: number }>();

  for (const node of laidOutRoot.descendants()) {
    if (!node.id || node.id === rootLayoutNode.id) {
      continue;
    }

    const width = (node.data.style?.width as number) ?? PAGE_WIDTH;
    const height = (node.data.style?.height as number) ?? PAGE_MIN_HEIGHT;

    positions.set(node.id, {
      x: node.y - width / 2,
      y: node.x - height / 2,
    });
  }

  const laidOutMainNodes = mainNodes.map((node) => ({
    ...node,
    position: positions.get(node.id) ?? node.position,
  }));

  const horizontallyCompactedNodes = compactPageColumns(laidOutMainNodes);
  const compactedMainNodes = compactPageRows(horizontallyCompactedNodes);

  // Reassemble in the original order, then place trailing nodes in their own
  // dedicated column to the right.
  const compactedById = new Map(compactedMainNodes.map((node) => [node.id, node]));
  const reassembled = nodes.map((node) => compactedById.get(node.id) ?? node);

  return placeTrailingNodes(reassembled);
};

const getLinearEdge = (
  source: string,
  target: string,
  sourceLabel: string,
  targetLabel?: string,
  isHighlighted?: boolean
): Edge => ({
  id: `e-${source}-${target}`,
  source,
  target,
  animated: !!isHighlighted,
  zIndex: isHighlighted ? 10 : 0,
  style: {
    ...(isHighlighted ? highlightedLineStyle : mutedLineStyle),
  },
  markerEnd: {
    ...arrowStyle,
    color: isHighlighted ? highlightedLineStyle.stroke : mutedLineStyle.stroke,
  },
  ariaLabel: `From ${sourceLabel} to ${targetLabel || target}`,
});

const edgeTouchesGroup = (source: string, target: string, groupId: string) => {
  if (!groupId) {
    return false;
  }

  const elementPrefix = `${groupId}::element::`;
  return source === groupId || target === groupId || source.startsWith(elementPrefix);
};

export const useFlowData = (
  lang: Language = "en",
  showReviewNode: boolean,
  hasReviewPage: boolean
) => {
  "use memo";
  const formGroups = useTemplateStore((state) => state.form.groups);
  const formElements = useTemplateStore((state) => state.form.elements || []);
  const selectedGroupId = useGroupStore((state) => state.id);
  const startElements = getStartElements(lang).map((element) => ({
    index: element.id,
    data: element.data.label,
  }));
  const reviewNode = getReviewNode(lang);
  const endNode = getEndNode(lang);

  const treeItems = groupsToTreeData(formGroups || {}, formElements, {
    reviewGroup: showReviewNode,
  });

  if (hasReviewPage) {
    endNode.type = "endNodeWithReview";
  }

  const getData = () => {
    const edges: Edge[] = [];
    const layoutEdges: Edge[] = [];
    const pageNodes: LayoutNode[] = [];
    const childNodes: Node<FlowElementNodeData>[] = [];
    const treeIndexes = treeItems.root.children;

    if (!treeIndexes) {
      return { edges, nodes: [] };
    }

    treeIndexes.forEach((key: TreeItemIndex) => {
      if (key === LOCKED_SECTIONS.REVIEW || key === LOCKED_SECTIONS.END) {
        return;
      }

      const treeItem: TreeItem = treeItems[key];
      const group: Group | undefined = formGroups && formGroups[key] ? formGroups[key] : undefined;

      const titleKey = "name" as const;
      const label = getLabelName(treeItem, key, lang, titleKey);
      const isOffBoardSection = treeItem.data.nextAction === "exit";
      const elementsWithRules = new Set(
        Array.isArray(group?.nextAction)
          ? group.nextAction.map((action) => Number(action.choiceId.split(".")[0]))
          : []
      );

      let children: Array<TreeItem | StaticChild> = [];

      if (key === LOCKED_SECTIONS.START) {
        children = [...startElements];
      }

      if (treeItem.children && treeItem.children.length > 0) {
        const groupChildren = treeItem.children
          .map((childId: TreeItemIndex) => treeItems[childId])
          .filter(Boolean) as TreeItem[];
        children = [...children, ...groupChildren];
      }

      const childData = children.map((child) => {
        const treeChild = !isStaticChild(child) ? child : undefined;
        const elementId = treeChild ? Number(treeChild.index) : undefined;
        const element = elementId ? formElements.find((item) => item.id === elementId) : undefined;

        return {
          child,
          elementId,
          isBranchable: isBranchableElement(element),
        };
      });

      const visibleChildren = childData;
      const pageWidth = PAGE_WIDTH;
      const pageHeaderHeight = PAGE_HEADER_HEIGHT;
      const pageChildHeight = PAGE_CHILD_HEIGHT;
      const pageChildGap = PAGE_CHILD_GAP;
      const pagePadding = PAGE_PADDING;
      const pageHeight = isOffBoardSection
        ? OFFBOARD_HEIGHT
        : getPageHeight(
            visibleChildren.length,
            PAGE_MIN_HEIGHT,
            pageChildHeight,
            pageChildGap,
            pageHeaderHeight,
            pagePadding
          );

      pageNodes.push({
        id: String(key),
        position: { x: 0, y: 0 },
        data: {
          label: {
            name: label,
          },
        },
        type: isOffBoardSection ? "offboardNode" : "groupNode",
        style: {
          width: isOffBoardSection ? PAGE_WIDTH : pageWidth,
          height: pageHeight,
        },
      });

      if (!isOffBoardSection) {
        visibleChildren.forEach(({ child, elementId }, index) => {
          const childKey = String(child.index);

          childNodes.push({
            id: getElementNodeId(String(key), childKey),
            type: "elementNode",
            parentId: String(key),
            extent: "parent",
            draggable: false,
            selectable: true,
            position: {
              x: pagePadding,
              y: pageHeaderHeight + pagePadding + index * (pageChildHeight + pageChildGap),
            },
            style: {
              width: pageWidth - pagePadding * 2,
              height: pageChildHeight,
            },
            data: {
              groupId: String(key),
              elementId,
              hasRules: typeof elementId === "number" && elementsWithRules.has(elementId),
              label: isStaticChild(child) ? child.data : undefined,
            },
          });
        });
      }

      if (!group) {
        return;
      }

      const sourceLabel = group.name || label;

      if (typeof group.nextAction === "undefined") {
        const isHighlighted = edgeTouchesGroup(String(key), defaultEdges.end, selectedGroupId);
        edges.push(
          getLinearEdge(String(key), defaultEdges.end, sourceLabel, "Confirmation", isHighlighted)
        );
        layoutEdges.push(getLinearEdge(String(key), defaultEdges.end, sourceLabel, "Confirmation"));
        return;
      }

      if (typeof group.nextAction === "string") {
        if (group.nextAction === "exit") {
          return;
        }

        let nextAction = group.nextAction;

        if (!showReviewNode && nextAction === LOCKED_SECTIONS.REVIEW) {
          nextAction = LOCKED_SECTIONS.END;
        }

        const isHighlighted = edgeTouchesGroup(String(key), nextAction, selectedGroupId);
        edges.push(
          getLinearEdge(
            String(key),
            nextAction,
            sourceLabel,
            formGroups?.[nextAction]?.name,
            isHighlighted
          )
        );
        layoutEdges.push(
          getLinearEdge(String(key), nextAction, sourceLabel, formGroups?.[nextAction]?.name)
        );
        return;
      }

      group.nextAction.forEach((action) => {
        let nextAction = action.groupId;

        if (!showReviewNode && action.groupId === LOCKED_SECTIONS.REVIEW) {
          nextAction = LOCKED_SECTIONS.END;
        }

        const [elementId] = action.choiceId.split(".");
        const source = getElementNodeId(String(key), elementId);
        const isHighlighted = edgeTouchesGroup(source, nextAction, selectedGroupId);

        edges.push({
          id: `e-${source}-${action.choiceId}-${nextAction}`,
          source,
          target: nextAction,
          animated: isHighlighted,
          zIndex: isHighlighted ? 10 : 0,
          style: {
            ...(isHighlighted ? highlightedLineStyle : mutedLineStyle),
          },
          markerEnd: {
            ...arrowStyle,
            color: isHighlighted ? highlightedLineStyle.stroke : mutedLineStyle.stroke,
          },
          label: getChoiceLabel(formElements, action.choiceId, lang),
          labelStyle: {
            fill: isHighlighted ? "#312E81" : "#64748B",
            fontSize: 12,
            fontWeight: 600,
          },
          ariaLabel: `From ${group.name} to ${formGroups?.[action.groupId]?.name || nextAction}`,
        });

        layoutEdges.push(
          getLinearEdge(String(key), nextAction, sourceLabel, formGroups?.[action.groupId]?.name)
        );
      });
    });

    if (showReviewNode) {
      pageNodes.push({
        ...reviewNode,
        data: {
          label: {
            name: reviewNode.data.label as string,
          },
        },
        style: {
          width: PAGE_WIDTH,
          height: PAGE_MIN_HEIGHT,
        },
      });
    }

    pageNodes.push({
      ...endNode,
      style: {
        width: PAGE_WIDTH,
        height: hasReviewPage ? 230 : 164,
      },
    });

    const laidOutPageNodes = layoutPageNodes(pageNodes, layoutEdges);

    return {
      edges,
      nodes: [...laidOutPageNodes, ...childNodes],
    };
  };

  const data = getData();

  return { ...data, getData };
};
