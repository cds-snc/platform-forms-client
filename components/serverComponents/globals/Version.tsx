import packageJson from "../../../package.json";

export const Version = async ({ label }: { label: string }) => {
  const { version } = packageJson;

  return (
    <div className="inline-block text-sm font-bold text-gray-700">
      {label}: {version}
    </div>
  );
};
