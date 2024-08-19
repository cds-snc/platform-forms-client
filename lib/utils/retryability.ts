/**
 * Returns the number of milliseconds to be used in an exponential backoff
 * @param  base The base number of milliseconds to wait
 * @param  attempt The number of times the operation has been attempted
 * @param  max The maximum amount of milliseconds to wait
 * @param  withJitter Set to true to add jitter (randomness) to the exponential backoff time that is returned
 * @returns The number of milliseconds to be used in an exponential backoff
 */
export const getExponentialBackoffTimeInMS = (
  base: number,
  attempt: number,
  max: number,
  withJitter: boolean = false
): number => {
  const backOffTime = Math.min(max, base * 2 ** attempt);

  if (!withJitter) {
    return backOffTime;
  }

  return 1 + Math.floor(Math.random() * backOffTime); //NOSONAR
};

export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
