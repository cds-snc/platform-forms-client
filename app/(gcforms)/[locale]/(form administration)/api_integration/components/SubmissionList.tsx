import { useState } from "react";
import { NewFormSubmission, PrivateApiKey } from "../lib/types";
import { Button } from "@clientComponents/globals";
import { showDirectoryPicker, FileSystemDirectoryHandle } from "native-file-system-adapter";
import { downloadAndConfirmFormSubmissions } from "../lib/utils";
import { GCFormsApiClient } from "../lib/apiClient";

export const SubmissionList = ({
  list,
  apiClient,
  privateKey,
}: {
  list: NewFormSubmission[];
  apiClient: GCFormsApiClient;
  privateKey: PrivateApiKey;
}) => {
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  return (
    <>
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">New Submissions</h2>
        <ul className="list-disc pl-5">
          {list.map((submission) => (
            <li key={submission.name}>
              {submission.name} - {new Date(submission.createdAt).toLocaleDateString()}
            </li>
          ))}
        </ul>
      </div>
      {directoryHandle ? (
        <>
          <p className="text-green-600">Save location set: {directoryHandle.name}</p>
          <Button
            onClick={() =>
              downloadAndConfirmFormSubmissions(directoryHandle, apiClient, privateKey, list)
            }
          >
            Download and Confirm
          </Button>
        </>
      ) : (
        <Button
          onClick={async () => {
            const directory = await showDirectoryPicker();
            setDirectoryHandle(directory);
          }}
        >
          Choose Save Location
        </Button>
      )}
    </>
  );
};
