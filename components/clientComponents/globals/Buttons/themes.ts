export const themes = {
  base: "inline-flex items-center rounded-md border-2 border-solid p-3 leading-[24px] transition-all duration-150 ease-in-out focus:border-gcds-blue-850 focus:bg-gcds-blue-850 focus:text-white-default focus:outline focus:outline-[3px] focus:outline-offset-2 focus:outline-gcds-blue-850 active:top-0.5 active:bg-black active:text-white-default active:outline-[3px] active:outline-offset-2 active:outline-gcds-blue-850 disabled:cursor-not-allowed disabled:!border-none disabled:bg-gray-light disabled:text-gray-dark font-medium",
  htmlLink: "no-underline visited:text-white-default",
  primary:
    "border-gcds-blue-800 bg-gcds-blue-900 text-white-default hover:border-gcds-blue-800 hover:bg-gcds-blue-800 hover:text-white-default active:border-black",
  secondary:
    "border-gcds-blue-800 bg-white-default text-gcds-blue-800 visited:text-gcds-blue-800 hover:bg-gcds-blue-100 hover:text-gcds-blue-800 active:border-black",
  destructive:
    "border-gcds-red-700 bg-gcds-red-700 text-white-default hover:border-gcds-red-900 hover:bg-gcds-red-900 active:border-black",
  link: "!border-none bg-transparent !p-0 text-gcds-blue-800 underline hover:no-underline focus:!text-white-default",
  icon: "ml-1.5 max-h-9 !rounded-full !border-none !p-1.5",
  disabled: "cursor-not-allowed border-none bg-gcds-gray-100 text-gcds-gray-800",
} as const;

export type Theme = keyof typeof themes;
