import { logMessage } from "@lib/logger";

interface TabsProps {
  tabsListEl: HTMLUListElement;
}

// Implemention (currently) allows keynav on a list and on activating by keyboard does a "click"
export class Tabs {
  tabsListEl: HTMLUListElement;
  tabsList: NodeListOf<HTMLElement>;
  // activeTabIndex: number;

  constructor({ tabsListEl }: TabsProps) {
    this.tabsListEl = tabsListEl;
    this.tabsList = this.tabsListEl.querySelectorAll("li > [role='tab']");

    // this.activeTabIndex = 0;
    // this.tabsList.forEach((tab, index) => {
    //   if (tab.getAttribute("aria-selected") === "true") {
    //     this.activeTabIndex = index;
    //   }
    // });
  }

  setFocus(tabEl: HTMLElement) {
    //, index: number) {
    // this.activeTabIndex = index;
    tabEl.focus();
  }

  activate(tabEl: HTMLElement) {
    tabEl.click();
  }

  next(tabEl: HTMLElement) {
    // const nextTabEl = this.tabsList[this.activeTabIndex + 1];
    const nextTabEl = tabEl.nextSibling; // || this.tabsListEl.children[0];

    if (nextTabEl) {
      // this.setFocus(nextTabEl, this.activeTabIndex + 1);
      this.setFocus(tabEl);
    } else {
      // Reached end of list, loop back to the first item
      // this.setFocus(this.tabsList[0], 0)
      this.setFocus(this.tabsList[0]);
    }
  }

  // prev() {
  //   const prevTabEl = this.tabsList[this.activeTabIndex - 1];
  //   if (prevTabEl) {
  //     this.setFocus(prevTabEl, this.activeTabIndex - 1);
  //   } else {
  //     // Reached start of list, loop back to the last item
  //     this.setFocus(this.tabsList[this.tabsList.length - 1], this.tabsList.length - 1);
  //   }
  // }

  onKey(e: KeyboardEvent) {
    logMessage.info(e);
    const key = e.key;
    let flag = false;

    switch (key) {
      case " ":
      case "Enter":
        // this.activate(this.tabsList[this.activeTabIndex]);
        flag = true;
        break;
      case "ArrowLeft":
        // this.prev();
        flag = true;
        break;
      case "ArrowRight":
        this.next(e);
        flag = true;
        break;
      case "Home":
        // Todo this.first(this.firstTab);
        flag = true;
        break;
      case "End":
        // Todo this.last(this.lastTab);
        flag = true;
    }

    if (flag) {
      e.stopPropagation();
      e.preventDefault();
    }
  }
}
