const fakeError = () => {
  throw new Error("Whoops!");
};

export const FakeError = ({ condition }: { condition: boolean }) => {
  return condition && <div className={fakeError()}>error</div>;
};
