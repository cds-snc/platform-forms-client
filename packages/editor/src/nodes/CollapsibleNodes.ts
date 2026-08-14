import { ElementNode, LexicalNode, SerializedElementNode, Spread } from "lexical";

export type SerializedCollapsibleNode = Spread<
  SerializedElementNode,
  { type: "collapsible-container" | "collapsible-title" | "collapsible-content" }
>;

class CollapsibleElementNode extends ElementNode {
  createDOM(): HTMLElement {
    return document.createElement("div");
  }

  updateDOM(): boolean {
    return false;
  }

  exportJSON(): SerializedCollapsibleNode {
    return {
      ...super.exportJSON(),
      type: this.getType() as SerializedCollapsibleNode["type"],
      version: 1,
    };
  }
}

export class CollapsibleContainerNode extends CollapsibleElementNode {
  static clone(node: CollapsibleContainerNode): CollapsibleContainerNode {
    return new CollapsibleContainerNode(node.__key);
  }
  static getType(): string {
    return "collapsible-container";
  }

  static importJSON(serializedNode: SerializedCollapsibleNode): CollapsibleContainerNode {
    void serializedNode;
    return $createCollapsibleContainerNode();
  }

  createDOM(): HTMLElement {
    const element = document.createElement("div");
    element.className = "collapsible-container";
    return element;
  }

  canBeEmpty(): boolean {
    return false;
  }
}

export class CollapsibleTitleNode extends CollapsibleElementNode {
  static clone(node: CollapsibleTitleNode): CollapsibleTitleNode {
    return new CollapsibleTitleNode(node.__key);
  }
  static getType(): string {
    return "collapsible-title";
  }

  static importJSON(serializedNode: SerializedCollapsibleNode): CollapsibleTitleNode {
    void serializedNode;
    return $createCollapsibleTitleNode();
  }

  createDOM(): HTMLElement {
    const element = document.createElement("div");
    element.className = "collapsible-title";
    return element;
  }
}

export class CollapsibleContentNode extends CollapsibleElementNode {
  static clone(node: CollapsibleContentNode): CollapsibleContentNode {
    return new CollapsibleContentNode(node.__key);
  }
  static getType(): string {
    return "collapsible-content";
  }

  static importJSON(serializedNode: SerializedCollapsibleNode): CollapsibleContentNode {
    void serializedNode;
    return $createCollapsibleContentNode();
  }

  createDOM(): HTMLElement {
    const element = document.createElement("div");
    element.className = "collapsible-content";
    return element;
  }
}

export const $createCollapsibleContainerNode = () => new CollapsibleContainerNode();
export const $createCollapsibleTitleNode = () => new CollapsibleTitleNode();
export const $createCollapsibleContentNode = () => new CollapsibleContentNode();

export const $isCollapsibleContainerNode = (
  node: LexicalNode | null | undefined
): node is CollapsibleContainerNode => node instanceof CollapsibleContainerNode;
export const $isCollapsibleTitleNode = (
  node: LexicalNode | null | undefined
): node is CollapsibleTitleNode => node instanceof CollapsibleTitleNode;
export const $isCollapsibleContentNode = (
  node: LexicalNode | null | undefined
): node is CollapsibleContentNode => node instanceof CollapsibleContentNode;
