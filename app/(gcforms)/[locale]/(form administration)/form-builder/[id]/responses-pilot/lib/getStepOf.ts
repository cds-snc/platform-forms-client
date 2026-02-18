export const steps = {
  "load-key": { current: 1, total: 3 },
  location: { current: 2, total: 3 },
  format: { current: 3, total: 3 },
};

export function getStepOf(step: keyof typeof steps) {
  return steps[step];
}
