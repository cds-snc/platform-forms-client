export const NoFileSystemAccess = () => {
  return (
    <div className="flex size-full flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">API Integration</h1>
      <div className="m-10">
        This browser does not support the File System Access API. Please use a compatible browser.
      </div>
    </div>
  );
};
