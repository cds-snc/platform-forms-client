import isRequestAllowed from "../../../../lib/middleware/httpRequestAllowed";
import { NextApiRequest, NextApiResponse } from "next";

const allowedMethods = ["GET", "INSERT", "UPDATE"];

const owners = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    res.status(200).json({ foo: req.query.form });
  } catch (err) {
    res.status(500).json({ error: "Malformed API Request" });
  }
};

export default isRequestAllowed(allowedMethods, owners);
