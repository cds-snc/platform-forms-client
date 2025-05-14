import { FormElement } from "@lib/types";

export const elementLoader = async (
  startIndex: number,
  onData: (data: FormElement, position: number) => void
) => {
  const el = document.getElementById("custom-elements") as HTMLTextAreaElement;
  if (el) {
    // get content of the textArea
    const content = el.value;

    // parse the content to JSON
    const data = JSON.parse(content);

    // call the handler with the parsed data
    onData(data, startIndex);
  }
};
