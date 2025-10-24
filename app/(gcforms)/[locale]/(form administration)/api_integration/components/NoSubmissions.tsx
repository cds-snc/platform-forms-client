export const NoSubmissions = ({ isLoading }: { isLoading: boolean }) => {
  return isLoading ? (
    <div className="flex max-w-full items-center justify-center">
      <p>Loading...</p>
    </div>
  ) : (
    <div className="flex max-w-full items-center justify-center">
      <p>No new form submissions found.</p>
    </div>
  );
};
