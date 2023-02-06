import React, { useEffect } from "react";
import useFormTimer from "@lib/hooks/useFormTimer";
import { cleanup, render, screen, waitFor } from "@testing-library/react";

// eslint-disable-next-line react/prop-types
const FakeComponent = ({ timerOn }) => {
  const [{ canSubmit, remainingTime, timerDelay }, { startTimer, checkTimer, disableTimer }] =
    useFormTimer();

  useEffect(() => {
    if (timerOn) {
      // Wait 2 seconds before submission
      startTimer(2);
      setTimeout(() => {
        checkTimer();
      }, 2000);
    } else {
      disableTimer();
    }
    // @todo - fix this eslint error
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerOn]);

  return (
    <>
      {canSubmit ? (
        <div data-testid="can-submit">Can Submit</div>
      ) : (
        <>
          <div data-testid="can-not-submit">Not yet</div>
          <div data-testid="remaining-time">{remainingTime}</div>
          <div data-testid="timer-delay">{timerDelay}</div>
        </>
      )}
    </>
  );
};

describe("Form Timer Hook", () => {
  afterEach(() => {
    cleanup();
  });
  it("Disables and allows submission", () => {
    render(<FakeComponent timerOn={false} />);
    const submitStatus = screen.getByTestId("can-submit");
    expect(submitStatus).toBeInTheDocument();
  });
  it("Enables and blocks submission", () => {
    render(<FakeComponent timerOn={true} />);
    const submitStatus = screen.getByTestId("can-not-submit");
    expect(submitStatus).toBeInTheDocument();
    expect(screen.getByTestId("timer-delay")).toHaveTextContent("2");
    expect(screen.getByTestId("remaining-time")).toHaveTextContent("2");
  });
  it("Awaits the appropriate amount of time before allowing submission", () => {
    render(<FakeComponent timerOn={true} />);

    expect(screen.getByTestId("can-not-submit")).toBeInTheDocument();

    waitFor(() => expect(screen.getByTestId("can-submit")).toBeInTheDocument(), {
      timeout: 5000,
    });
  });
});
