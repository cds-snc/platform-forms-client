type SubmissionInfo = {
  submissionId: string;
  submissionDate: string;
};

const getStorageKeys = (formId: string) => {
  const key = `gcforms:pending-submission:${formId}`;
  return {
    submissionId: `${key}:id`,
    submissionDate: `${key}:date`,
  };
};

export const storePendingSubmissionInfo = (
  formId: string,
  submissionId: string,
  submissionDate: string
) => {
  const keys = getStorageKeys(formId);
  sessionStorage.setItem(keys.submissionId, submissionId);
  sessionStorage.setItem(keys.submissionDate, submissionDate);
};

export const takePendingSubmissionInfo = (formId: string): SubmissionInfo | null => {
  const keys = getStorageKeys(formId);
  const submissionId = sessionStorage.getItem(keys.submissionId);
  const submissionDate = sessionStorage.getItem(keys.submissionDate);
  sessionStorage.removeItem(keys.submissionId);
  sessionStorage.removeItem(keys.submissionDate);

  if (!submissionId || !submissionDate) {
    return null;
  }

  return { submissionId, submissionDate };
};
