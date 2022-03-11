import { NextApiRequest, NextApiResponse } from "next";
import { cors, middleware } from "@lib/middleware";
import axios from "axios";

const verifyReCaptchaToken = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userToken } = req.body;
    if (userToken) {
      const reCAPTCHASecret = process.env.RECAPTACHA_V3_SECRET_KEY;
      const response = await axios({
        url: `https://www.google.com/recaptcha/api/siteverify?secret=${reCAPTCHASecret}&response=${userToken}`,
        method: "POST",
        timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
      });
      res.status(200).json({ ...response.data });
    } else {
      res.status(404).json({ error: "Bad request" });
    }
  } catch (err) {
    res.status(500).json({ error: "Malformed API Request" });
  }
};

export default middleware([cors({ allowedMethods: ["POST"] })], verifyReCaptchaToken);
