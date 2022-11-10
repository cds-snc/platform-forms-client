import React from "react";
import { render, cleanup, screen } from "@testing-library/react";
import { TabsList } from "@components/myforms/Tabs/TabsList";
import { Tab } from "@components/myforms/Tabs/Tab";
import { TabPanel } from "@components/myforms/Tabs/TabPanel";

const tabsData = {
  id: "title-tabs",
  title: "Tabs Title",
};

const tabData_1 = {
  id: "tab-1",
  tabpanelId: "tabpanel-1",
  url: "/1",
  isActive: true,
};

const tabData_2 = {
  id: "tab-2",
  tabpanelId: "tabpanel-2",
  url: "/2",
  isActive: false,
};

const tabpanelData_1 = {
  id: "tabpanel-1",
  labeledbyId: "tab-1",
  isActive: true,
};

const tabpanelData_2 = {
  id: "tabpanel-2",
  labeledbyId: "tab-2",
  isActive: false,
};

// TODO: waiting for more unit tests until keynav is added to Tabs

describe("Tabs component", () => {
  afterEach(cleanup);

  test("renders without errors", () => {
    render(
      <>
        <h2 id={tabsData.id}>{tabsData.title}</h2>
        <TabsList labeledby={tabsData.id}>
          <Tab
            url={tabData_1.url}
            isActive={tabData_1.isActive}
            id={tabData_1.id}
            tabpanelId={tabData_1.tabpanelId}
          >
            Tab 1
          </Tab>
          <Tab
            url={tabData_2.url}
            isActive={tabData_2.isActive}
            id={tabData_2.id}
            tabpanelId={tabData_2.tabpanelId}
          >
            Tab 2
          </Tab>
        </TabsList>
        <TabPanel
          id={tabpanelData_1.id}
          labeledbyId={tabpanelData_1.labeledbyId}
          isActive={tabpanelData_1.isActive}
        >
          TabPanel 1
        </TabPanel>
        <TabPanel
          id={tabpanelData_2.id}
          labeledbyId={tabpanelData_2.labeledbyId}
          isActive={tabpanelData_2.isActive}
        >
          TabPanel 2
        </TabPanel>
      </>
    );
    expect(screen.getByText(/Tab 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Tab 2/i)).toBeInTheDocument();
    expect(screen.getByText(/TabPanel 1/i)).toBeInTheDocument();
    expect(screen.getByText(/TabPanel 2/i)).toBeInTheDocument();
  });
});
