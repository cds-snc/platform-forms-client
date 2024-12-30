export type Responses = {
  [key: string]: Response;
};

export type Response =
  | string
  | string[]
  | number
  | Record<string, unknown>[]
  | FileInputResponse
  | FileInputResponse[]
  | Record<string, unknown>
  | TaggedResponse;

export type FileInputResponse = {
  name: string | null;
  size: number | null;
  based64EncodedFile: string | null;
};

export type TaggedResponse = {
  tag: string;
  answer: Response;
};
