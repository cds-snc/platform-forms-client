import React from "react";
import { render, cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MenuDropdown } from "@components/myforms/MenuDropdown/MenuDropdown";

const menuData = {
  id: "1",
  title: "Menu Title",
  items: [
    {
      title: "Menu Item A",
      url: "#A",
    },
    {
      title: "Menu Item B",
      url: "#B",
    },
    {
      title: "Menu Item C",
      url: "#C",
    },
  ],
};

describe("Card component", () => {
  afterEach(cleanup);

  test("renders without errors", () => {
    render(
      <MenuDropdown id={menuData.id} items={menuData.items}>
        {menuData.title}
      </MenuDropdown>
    );
    expect(screen.getByText(/Menu Title/i)).toBeInTheDocument();
  });

  test("menu has list items", async () => {
    render(
      <MenuDropdown id={menuData.id} items={menuData.items}>
        {menuData.title}
      </MenuDropdown>
    );

    expect(screen.getByText(/Menu Item A/i)).toBeInTheDocument();
    expect(screen.queryByRole("a", { url: "#A" }));
    expect(screen.getByText(/Menu Item B/i)).toBeInTheDocument();
    expect(screen.queryByRole("a", { url: "#B" }));
    expect(screen.getByText(/Menu Item C/i)).toBeInTheDocument();
    expect(screen.queryByRole("a", { url: "#C" }));
  });

  test("menu opens on click", async () => {
    render(
      <MenuDropdown id={menuData.id} items={menuData.items}>
        {menuData.title}
      </MenuDropdown>
    );

    const user = userEvent.setup();
    await user.click(screen.getByText(/Menu Title/i));
    expect(screen.queryByRole("button", { expanded: "true" }));
  });

  test("menu closes on click", async () => {
    render(
      <MenuDropdown id={menuData.id} items={menuData.items}>
        {menuData.title}
      </MenuDropdown>
    );

    const user = userEvent.setup();
    await user.click(screen.getByText(/Menu Title/i));
    expect(screen.queryByRole("button", { expanded: "true" }));
    await user.click(screen.getByText(/Menu Title/i));
    expect(screen.queryByRole("button", { expanded: "false" }));
  });
});
