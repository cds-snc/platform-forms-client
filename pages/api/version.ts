import { NextApiRequest, NextApiResponse } from "next";
import versionContent from "../../VERSION";
import changeLog from "../../CHANGELOG.md";

const version = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const versionInfo = {
    version: versionContent,
    changeLog: changeLog,
  };
  res.json(versionInfo);
};

export default version;
