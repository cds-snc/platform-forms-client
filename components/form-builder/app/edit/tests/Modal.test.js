import React from "react";
import { render, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "../Modal";

describe("Modal", () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.show = jest.fn();
    HTMLDialogElement.prototype.showModal = jest.fn();
    HTMLDialogElement.prototype.close = jest.fn();
  });

  it("renders the modal", async () => {
    const rendered = render(
      <Modal title={"more options"} openButton={<button>more...</button>} defaultOpen={true}>
        Modal content
      </Modal>
    );

    expect(rendered.getByTestId("modal")).toBeInTheDocument();
    expect(rendered.getByText("more options")).toBeInTheDocument();

    expect(rendered.getByText("Modal content")).toBeInTheDocument();
    expect(rendered.getByLabelText("close")).toBeInTheDocument();
    expect(rendered.getByText("cancel")).toBeInTheDocument();
  });

  it("renders modal button", async () => {
    const rendered = render(
      <Modal title={"more options"} openButton={<button>more...</button>}>
        Modal content
      </Modal>
    );

    expect(rendered.getByRole("button", { name: "more..." })).toBeInTheDocument();
  });

  it("opens and closes modal", async () => {
    const mockedCallback = jest.fn();
    const rendered = render(
      <Modal
        title={"more options"}
        openButton={
          <button
            onClick={() => {
              mockedCallback();
            }}
          >
            more...
          </button>
        }
      >
        Modal content
      </Modal>
    );

    expect(rendered.getByRole("button", { name: "more..." })).toBeInTheDocument();

    const modalButton = rendered.getByRole("button", { name: "more..." });

    userEvent.click(modalButton);

    await waitFor(() => {
      expect(mockedCallback).toHaveBeenCalled();
    });

    const closeButton = rendered.getByLabelText("close");

    expect(closeButton).toBeInTheDocument();

    userEvent.click(closeButton);

    await waitForElementToBeRemoved(() => rendered.container.querySelector("dialog"));
  });
});
