// format used by Prisma-generated form IDs
const FORM_ID_PATTERN = /^[a-z0-9]{20,40}$/;
export const isValidFormId = (id: string): boolean => {
  return FORM_ID_PATTERN.test(id);
};
