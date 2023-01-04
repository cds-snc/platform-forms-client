interface TabsProps {
  tabsListEl: HTMLElement;
}

// Note: only the active tab button or anchor does not have a tabindex. This way only the active
// tab is in the keyboard tab order. The user can navigate the tabs using arrow keys and activate
// a tab using space or enter.
export class TabsKeynav {
  tabsListEl: HTMLElement;
  tabsList: Array<HTMLElement>;

  constructor({ tabsListEl }: TabsProps) {
    this.tabsListEl = tabsListEl;
    this.tabsList = Array.from(this.tabsListEl.querySelectorAll("[role='tab']"));
  }

  setFocus(tabEl: HTMLElement) {
    tabEl.focus();
  }

  // Note: aria-selected should auto update based on Tab prop isActive
  // Note: tabindex should auto auto update based on Tab prop isActive
  activate(e: KeyboardEvent) {
    const itemToActivate = (e?.target || e) as HTMLAnchorElement | HTMLButtonElement;
    // React element will always be the target A or BUTTON but check for native DOM
    if (itemToActivate.nodeName === "A" || itemToActivate.nodeName === "BUTTON") {
      itemToActivate.click();
    }
  }

  next(e: KeyboardEvent) {
    const currentTab = (e?.target || e) as HTMLAnchorElement | HTMLButtonElement;
    const tabIndex = this.getTabIndex(currentTab);
    // Get the next tab, or if none then go back to the beginning of the tab list
    const nextTabEl = this.tabsList[tabIndex + 1] || this.tabsList[0];
    this.setFocus(nextTabEl);
  }

  prev(e: KeyboardEvent) {
    const currentTab = (e?.target || e) as HTMLAnchorElement | HTMLButtonElement;
    const tabIndex = this.getTabIndex(currentTab);
    // Get the previous tab, or if none then loop around to the end of the tab list
    const nextTabEl = this.tabsList[tabIndex - 1] || this.tabsList[this.tabsList.length - 1];
    this.setFocus(nextTabEl);
  }

  first() {
    this.setFocus(this.tabsList[0]);
  }

  last() {
    this.setFocus(this.tabsList[this.tabsList.length - 1]);
  }

  getTabIndex(tabEl: HTMLElement) {
    let tabIndex = -1;
    this.tabsList.forEach((tab, index) => {
      if (tab === tabEl) {
        tabIndex = index;
      }
    });
    return tabIndex >= 0 ? tabIndex : 0;
  }

  onKey(e: KeyboardEvent) {
    const key = e.key;
    let flag = false;

    switch (key) {
      case " ":
      case "Enter":
        this.activate(e);
        flag = true;
        break;
      case "ArrowLeft":
        this.prev(e);
        flag = true;
        break;
      case "ArrowRight":
        this.next(e);
        flag = true;
        break;
      case "Home":
        this.first();
        flag = true;
        break;
      case "End":
        this.last();
        flag = true;
    }

    if (flag) {
      e.stopPropagation();
      e.preventDefault();
    }
  }
}
