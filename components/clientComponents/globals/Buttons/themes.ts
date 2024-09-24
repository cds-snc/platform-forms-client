export const themes = {
  base: "inline-flex items-center rounded-lg border-2 border-solid p-3 leading-[24px] transition-all duration-150 ease-in-out focus:border-blue-active focus:bg-blue-focus focus:text-white-default focus:outline focus:outline-[3px] focus:outline-offset-2 focus:outline-blue-focus active:top-0.5 active:bg-black active:text-white-default active:outline-[3px] active:outline-offset-2 active:outline-blue-focus disabled:cursor-not-allowed disabled:!border-none disabled:bg-gray-light disabled:text-gray-dark",
  htmlLink: "no-underline visited:text-white-default",
  primary:
    "border-blue bg-blue-default text-white-default hover:border-blue-light hover:bg-blue-light hover:text-white-default active:border-black",
  secondary:
    "border-gcds-secondary-txt bg-white-default text-gcds-secondary-txt visited:text-gcds-secondary-txt hover:bg-gcds-secondary-bkd hover:text-gcds-secondary-txt active:border-black",
  destructive:
    "border-red-destructive bg-red-destructive text-white-default hover:border-red-hover hover:bg-red-hover active:border-black",
  link: "!border-none bg-transparent !p-0 text-blue-default underline hover:no-underline focus:!text-white-default",
  icon: "ml-1.5 max-h-9 !rounded-full !border-none bg-gray-selected !p-1.5 hover:bg-gray-600",
  disabled: "cursor-not-allowed border-none bg-[#e2e8ef] text-[#748094]",
} as const;

export type Theme = keyof typeof themes;
