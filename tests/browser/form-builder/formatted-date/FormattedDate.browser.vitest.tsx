import { describe, it, expect, beforeAll } from "vitest";
import { page } from "@vitest/browser/context";
import { FormattedDate } from "@clientComponents/forms/FormattedDate/FormattedDate";
import { DateFormat } from "@clientComponents/forms/FormattedDate/types";
import { Formik } from "formik";
import { render } from "../testUtils";
import { setupFonts } from "../../helpers/setupFonts";

import "@root/styles/app.scss";

describe("<FormattedDate />", () => {
  beforeAll(() => {
    setupFonts();
  });

  it("mounts", async () => {
    await render(
      <Formik
        initialValues={{}}
        onSubmit={() => {
          throw new Error("Function not implemented.");
        }}
      >
        <FormattedDate name="formattedDate" />
      </Formik>
    );

    const formattedDate = page.getByTestId("formattedDate");
    await expect.element(formattedDate).toBeInTheDocument();

    const monthNumber = page.getByTestId("month-number");
    await expect.element(monthNumber).toBeInTheDocument();

    const yearNumber = page.getByTestId("year-number");
    await expect.element(yearNumber).toBeInTheDocument();

    const dayNumber = page.getByTestId("day-number");
    await expect.element(dayNumber).toBeInTheDocument();

    // Default dateFormat is YYYY-MM-DD
    const elements = document.querySelectorAll("[data-testid=formattedDate] [data-testid]");
    expect(elements[0].getAttribute("data-testid")).toBe("year-number");
    expect(elements[1].getAttribute("data-testid")).toBe("month-number");
    expect(elements[2].getAttribute("data-testid")).toBe("day-number");
  });

  it("sets date format to DD-MM-YYYY", async () => {
    await render(
      <Formik
        initialValues={{}}
        onSubmit={() => {
          throw new Error("Function not implemented.");
        }}
      >
        <FormattedDate name="formattedDate" dateFormat="DD-MM-YYYY" />
      </Formik>
    );

    const formattedDate = page.getByTestId("formattedDate");
    await expect.element(formattedDate).toBeInTheDocument();

    const elements = document.querySelectorAll("[data-testid=formattedDate] [data-testid]");
    expect(elements[0].getAttribute("data-testid")).toBe("day-number");
    expect(elements[1].getAttribute("data-testid")).toBe("month-number");
    expect(elements[2].getAttribute("data-testid")).toBe("year-number");
  });

  it("sets date format to MM-DD-YYYY", async () => {
    await render(
      <Formik
        initialValues={{}}
        onSubmit={() => {
          throw new Error("Function not implemented.");
        }}
      >
        <FormattedDate name="formattedDate" dateFormat="MM-DD-YYYY" />
      </Formik>
    );

    const formattedDate = page.getByTestId("formattedDate");
    await expect.element(formattedDate).toBeInTheDocument();

    const elements = document.querySelectorAll("[data-testid=formattedDate] [data-testid]");
    expect(elements[0].getAttribute("data-testid")).toBe("month-number");
    expect(elements[1].getAttribute("data-testid")).toBe("day-number");
    expect(elements[2].getAttribute("data-testid")).toBe("year-number");
  });

  it("sets date format to YYYY-MM-DD", async () => {
    await render(
      <Formik
        initialValues={{}}
        onSubmit={() => {
          throw new Error("Function not implemented.");
        }}
      >
        <FormattedDate name="formattedDate" dateFormat="YYYY-MM-DD" />
      </Formik>
    );

    const formattedDate = page.getByTestId("formattedDate");
    await expect.element(formattedDate).toBeInTheDocument();

    const elements = document.querySelectorAll("[data-testid=formattedDate] [data-testid]");
    expect(elements[0].getAttribute("data-testid")).toBe("year-number");
    expect(elements[1].getAttribute("data-testid")).toBe("month-number");
    expect(elements[2].getAttribute("data-testid")).toBe("day-number");
  });

  it("defaults to YYYY-MM-DD when dateFormat is invalid", async () => {
    await render(
      <Formik
        initialValues={{}}
        onSubmit={() => {
          throw new Error("Function not implemented.");
        }}
      >
        <FormattedDate name="formattedDate" dateFormat={"XXXX-XX-XX" as unknown as DateFormat} />
      </Formik>
    );

    const formattedDate = page.getByTestId("formattedDate");
    await expect.element(formattedDate).toBeInTheDocument();

    const elements = document.querySelectorAll("[data-testid=formattedDate] [data-testid]");
    expect(elements[0].getAttribute("data-testid")).toBe("year-number");
    expect(elements[1].getAttribute("data-testid")).toBe("month-number");
    expect(elements[2].getAttribute("data-testid")).toBe("day-number");
  });

  it("renders a legend for the fieldset", async () => {
    await render(
      <Formik
        initialValues={{}}
        onSubmit={() => {
          throw new Error("Function not implemented.");
        }}
      >
        <FormattedDate name="formattedDate" label="Enter a date" />
      </Formik>
    );

    const legend = document.querySelector("[data-testid=formattedDate] legend");
    expect(legend).toBeTruthy();
    expect(legend?.textContent).toContain("Enter a date");
  });

  it("sets autocomplete bday for the inputs", async () => {
    await render(
      <Formik
        initialValues={{}}
        onSubmit={() => {
          throw new Error("Function not implemented.");
        }}
      >
        <FormattedDate name="formattedDate" autocomplete="bday" />
      </Formik>
    );

    const yearNumber = page.getByTestId("year-number");
    await expect.element(yearNumber).toHaveAttribute("autocomplete", "bday-year");

    const monthNumber = page.getByTestId("month-number");
    await expect.element(monthNumber).toHaveAttribute("autocomplete", "bday-month");

    const dayNumber = page.getByTestId("day-number");
    await expect.element(dayNumber).toHaveAttribute("autocomplete", "bday-day");
  });

  it("adds aria-describedby description", async () => {
    await render(
      <Formik
        initialValues={{}}
        onSubmit={() => {
          throw new Error("Function not implemented.");
        }}
      >
        <FormattedDate
          name="formattedDate"
          label="Enter a date"
          description="This is a description"
        />
      </Formik>
    );

    const formattedDate = page.getByTestId("formattedDate");
    await expect.element(formattedDate).toHaveAttribute("aria-roledescription");
    await expect.element(formattedDate).toHaveAttribute("aria-labelledby");

    const description = page.getByTestId("description");
    await expect.element(description).toBeInTheDocument();
    const descriptionText = await description.element().textContent;
    expect(descriptionText).toContain("This is a description");
  });
});
