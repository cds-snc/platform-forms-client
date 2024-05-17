export type FuncWithConfirm = (confirm: Promise<boolean>) => Promise<boolean>;

export const doSomething: FuncWithConfirm = async (confirm) => {
  try {
    await confirm;
    return true;
  } catch (err) {
    return false;
  }
};
