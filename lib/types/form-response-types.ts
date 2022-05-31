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
  | Record<string, unknown>;

export type FileInputResponse = {
  name: string;
  file: string;
  [key: string]: string | number | File | FileReader;
};
