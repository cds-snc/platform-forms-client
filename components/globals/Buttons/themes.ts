export const themes = {
  base: "py-2 px-5 rounded-lg border-2 border-solid inline-flex items-center active:top-0.5 focus:outline-[3px] focus:outline-blue-focus focus:outline focus:outline-offset-2 focus:bg-blue-focus focus:text-white-default disabled:cursor-not-allowed disabled:text-gray-500 disabled:!border-grey-default",
  htmlLink: "visited:text-white-default no-underline active:shadow-none focus:shadow-none",
  primary:
    "bg-blue-dark text-white-default border-black-default hover:text-white-default hover:bg-blue-light active:text-white-default active:bg-blue-active",
  secondary:
    "bg-white-default text-black-default border-black-default hover:text-white-default hover:bg-gray-600 active:text-white-default active:bg-gray-500",
  destructive:
    "bg-red-default text-white-default border-red-default hover:bg-red-destructive hover:border-red-destructive active:bg-red-hover focus:border-blue-hover",
  link: "!p-0 !border-none text-black-default underline bg-transparent hover:no-underline focus:!text-white-default",
  icon: "!border-none bg-gray-selected hover:bg-gray-600 !rounded-full max-h-9 !p-1.5 ml-1.5",
} as const;

export type Theme = keyof typeof themes;
