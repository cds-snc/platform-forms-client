interface Options {
  isCloseOnActivate: boolean;
}

interface MenuProps {
  menuButton: HTMLButtonElement;
  menuList: HTMLUListElement;
  options?: Options;
}

// TODO: could also add character search on menu list in future

/**
 * Adds keybaord behavior for a HTML list element.
 */
export class Menu {
  menuButton: HTMLButtonElement;
  menuList: HTMLUListElement;
  menuListItems: NodeListOf<HTMLElement>;
  menuListActiveIndex: number;
  isCloseOnActivate: boolean;

  constructor({ menuButton, menuList, options }: MenuProps) {
    this.menuList = menuList;
    this.menuButton = menuButton;
    this.menuListItems = menuList.querySelectorAll("li > .action");
    this.menuListActiveIndex = 0;
    this.isCloseOnActivate = options?.isCloseOnActivate || false;

    if (this.menuListItems.length === 0) {
      throw new Error("MenuDrop down requires a menu list with a size greater than 0.");
    }
  }

  activateKey(e: KeyboardEvent) {
    // React synthetic events have no e.target so compensate
    const itemToActivate = (e.target || e) as HTMLAnchorElement | HTMLButtonElement;
    // React element will always be the target A or BUTTON but check for native DOM
    if (itemToActivate.nodeName === "A" || itemToActivate.nodeName === "BUTTON") {
      // Note: close() called when this emits click event to activateClick()
      itemToActivate.click();
    }
  }

  setFocus(menuItem: HTMLElement, index: number) {
    // Clean up
    this.removeFocus();
    // Focus next
    this.menuListActiveIndex = index;
    menuItem.classList.add("active");
    menuItem.focus();
    this.menuList.setAttribute("aria-activedescendant", menuItem.id);
  }

  removeFocus() {
    const oldMenuItem = this.menuListItems[this.menuListActiveIndex];
    oldMenuItem.classList.remove("active");
  }

  focusFirst() {
    this.setFocus(this.menuListItems[0], 0);
  }

  focusLast() {
    this.setFocus(this.menuListItems[this.menuListItems.length - 1], this.menuListItems.length - 1);
  }

  focusNext() {
    const nextMenuItem = this.menuListItems[this.menuListActiveIndex + 1];
    if (!nextMenuItem) {
      this.focusFirst();
    } else {
      this.setFocus(nextMenuItem, this.menuListActiveIndex + 1);
    }
  }

  focusPrev() {
    const prevMenuItem = this.menuListItems[this.menuListActiveIndex - 1];
    if (!prevMenuItem) {
      this.focusLast();
    } else {
      this.setFocus(prevMenuItem, this.menuListActiveIndex - 1);
    }
  }

  open() {
    this.menuList.style.display = "block";
    this.menuButton.setAttribute("aria-expanded", "true");
    this.menuList.focus(); // TODO: forget purpose of this?
    this.focusFirst();
  }

  close() {
    this.removeFocus();
    this.menuButton.removeAttribute("aria-expanded");
    this.menuList.setAttribute("aria-activedescendant", "");
    this.menuList.style.display = "none";
    this.menuButton.focus();
  }

  isOpen() {
    return this.menuButton.getAttribute("aria-expanded") === "true";
  }

  toggle() {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  onMenuButtonKey(e: KeyboardEvent) {
    const key = e.key;
    let flag = false;

    switch (key) {
      case " ":
      case "Enter":
      case "ArrowDown":
      case "Down":
        flag = true;
        this.open();
        break;
      case "Up":
      case "ArrowUp":
        flag = true;
        this.open();
        break;
      case "Esc":
      case "Escape":
        flag = true;
        this.close();
        break;
      case "Tab":
        // Allow rare case of being on menu button and tabbing away from an open menu, should close
        flag = false; // Making it obvious
        this.close();
    }

    if (flag) {
      e.stopPropagation();
      e.preventDefault();
    }
  }

  onMenuListKeydown(e: KeyboardEvent) {
    const key = e.key;
    let flag = false;

    if (e.ctrlKey || e.altKey || e.metaKey) {
      return;
    }

    switch (key) {
      case " ":
      case "Enter":
        flag = true;
        if (this.isCloseOnActivate) {
          this.close();
        }
        this.activateKey(e);
        break;
      case "Esc":
      case "Escape":
        flag = true;
        this.close();
        break;
      case "Up":
      case "ArrowUp":
        flag = true;
        this.focusPrev();
        break;
      case "ArrowDown":
      case "Down":
        flag = true;
        this.focusNext();
        break;
      case "Home":
      case "PageUp":
        flag = true;
        this.focusFirst();
        break;
      case "End":
      case "PageDown":
        flag = true;
        this.focusLast();
        break;
      case "Tab":
        flag = false; // Making it obvious
        this.close();
    }

    if (flag) {
      e.stopPropagation();
      e.preventDefault();
    }
  }
}
