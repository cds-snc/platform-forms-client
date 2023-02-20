export const loadTemplate = (template: string) => {
  const templatePath = `./${template}`;
  return import(templatePath).then((module) => module.default);
};
