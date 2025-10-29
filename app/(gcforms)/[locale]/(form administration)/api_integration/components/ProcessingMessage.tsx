import { type JSX } from "react";
import { TokenRateLimitError } from "../lib/errorsTypes";
import { Danger, Success } from "@clientComponents/globals/Alert/Alert";
import { MapleLeafLoader } from "@clientComponents/icons/MapleLeafLoader";

export const ProcessingMessage = ({
  completed,
  responsesProcessed,
  error,
  retryButton,
}: {
  completed: boolean;
  responsesProcessed: number;
  error: Error | null;
  retryButton: JSX.Element | null;
}) => {
  if (error instanceof TokenRateLimitError) {
    return (
      <>
        <Danger title="Error" body="You have hit the token rate limit. Please try again later." />
        {retryButton}
      </>
    );
  }

  if (error) {
    return (
      <>
        <Danger title="Error" body="An error occurred while processing submissions" />
        {retryButton}
      </>
    );
  }

  if (responsesProcessed === 0 && !completed) {
    return null;
  }

  if (responsesProcessed > 0 && !completed) {
    return (
      <div>
        <MapleLeafLoader
          message={`Processing ${responsesProcessed} responses...`}
          width={300}
          height={350}
        />
      </div>
    );
  }

  if (completed) {
    return (
      <Success
        className="w-full min-w-full"
        title={"Success"}
        body={"Responses processed successfully!"}
      />
    );
  }
};
