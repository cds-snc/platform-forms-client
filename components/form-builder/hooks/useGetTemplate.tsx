import useTemplateStore from "../store/useTemplateStore";

export const useGetTemplate = () => {
  const { getSchema } = useTemplateStore();

  const schema = getSchema();

  const stringified = JSON.stringify(schema, null, 2);

  return { schema, stringified };
};
