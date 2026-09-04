export const shouldCheckCaptcha = (isPublished: boolean) => {
  return (
    process.env.NODE_ENV !== "development" &&
    process.env.NEXT_PUBLIC_APP_ENV !== "test" &&
    isPublished
  );
};
