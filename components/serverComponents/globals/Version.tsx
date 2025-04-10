import packageJson from "../../../package.json";

export const Version = async ({ label }: { label: string }) => {
  const { version } = packageJson;

  return (
    <div className="text-sm text-gray-600">
      {label}: {version}
    </div>
  );
};
