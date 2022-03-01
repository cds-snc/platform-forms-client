import isRequestAllowed from "../../lib/middleware/httpRequestAllowed";
import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const allowedMethods = ["POST"];

const verifyUserResponse = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const requestBody = req.body;
    const { userToken } = requestBody;
    if (userToken) {
      const reCAPTCHASecret = process.env.RECAPTACHA_V3_SECRET_KEY;
      const response = await axios({
        url: `https://www.google.com/recaptcha/api/siteverify?secret=${reCAPTCHASecret}&response=${userToken}`,
        method: "POST",
        timeout: process.env.NODE_ENV === "production" ? 60000 : 80000,
      });
      res.status(200).json({ data: response.data });
    } else {
      res.status(404).json({ error: "Bad request" });
    }
  } catch (err) {
    res.status(500).json({ error: "Malformed API Request" });
  }
};

export default isRequestAllowed(allowedMethods, verifyUserResponse);
