export const NoSubmissions = ({ isLoading }) => {
  return isLoading ? (
    <div>
      <p>Loading...</p>
    </div>
  ) : (
    <div>
      <p>No new form submissions found.</p>
    </div>
  );
};
