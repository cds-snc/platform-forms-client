export const validateTemplateSize = (formConfig: string) => {
  const maxPayloadSize = 5 * 1024 * 1024; // 5 MB

  try {
    const formConfigSize = formConfig.length;

    if (formConfigSize > maxPayloadSize) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
};
