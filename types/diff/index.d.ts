declare module "diff" {
  export type Change = {
    value: string;
    added?: boolean;
    removed?: boolean;
    count?: number;
  };

  export function diffLines(oldStr: string, newStr: string): Change[];
}
