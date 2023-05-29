// Note: Button themes copied from Buttons/themes. This was done so button themes and vice versa
// can be updated without impacting each other.

export const themes = {
  baseButton:
    "no-underline py-2 px-5 rounded-lg border-2 border-solid inline-flex items-center active:top-0.5 focus:outline-[3px] focus:outline-blue-focus focus:outline focus:outline-offset-2 focus:bg-blue-focus focus:border-blue-active focus:text-white-default active:text-white-default active:bg-blue-active active:outline-[3px] active:outline-blue-focus active:outline-offset-2 active:bg-blue-focus disabled:cursor-not-allowed disabled:text-gray-dark disabled:bg-gray-light disabled:!border-none",
  primaryButton:
    "bg-blue-default border-blue text-white-default hover:text-white-default hover:bg-blue-light hover:border-blue-light",
  secondaryButton:
    "bg-white-default text-blue-default visited:text-blue-default border-blue-default hover:text-white-default hover:bg-gray-600",
} as const;

export type Theme = keyof typeof themes;
