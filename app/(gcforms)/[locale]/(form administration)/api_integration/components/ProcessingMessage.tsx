import { Loader } from "@clientComponents/globals/Loader";

export const ProcessingMessage = ({
  completed,
  responsesProcessed,
  tokenRateLimiter,
}: {
  completed: boolean;
  responsesProcessed: number;
  tokenRateLimiter: boolean;
}) => {
  return (
    <>
      {completed ? (
        <p className="mt-5">Responses processed successfully!</p>
      ) : (
        <div className="mt-5">
          {responsesProcessed > 0 ? (
            <div>
              <Loader message={`Processing ${responsesProcessed} responses...`} />{" "}
            </div>
          ) : null}
        </div>
      )}
      {tokenRateLimiter ? (
        <p className="mt-5 text-red-600">
          You have hit the token rate limit. Please try again later.
        </p>
      ) : null}
    </>
  );
};
