import { FormElement, FormElementTypes } from "@lib/types";

export const loader = async ({
  type,
  handleAddElement,
}: {
  type: string;
  handleAddElement: (index: number, type: FormElementTypes, data: FormElement) => void;
}) => {
  const fetcher = (url: string) =>
    fetch(url, {
      method: "POST",
      body: JSON.stringify({
        elementType: type,
      }),
    }).then((res) => res.json());
  const result = await fetcher("/api/staticdata/");
  result.forEach((el: FormElement) => {
    handleAddElement(0, el.type, el);
  });
};
