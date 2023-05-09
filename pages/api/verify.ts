import { NextApiRequest, NextApiResponse } from "next";
import { cors, middleware } from "@lib/middleware";
import axios from "axios";

const verifyReCaptchaToken = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userToken } = req.body;
    if (userToken) {
      const reCAPTCHASecret = process.env.RECAPTCHA_V3_SECRET_KEY;
      const response = await axios({
        url: `https://www.google.com/recaptcha/api/siteverify?secret=${reCAPTCHASecret}&response=${userToken}`,
        method: "POST",
        timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
      });
      res.status(200).json({ ...response.data });
    } else {
      res.status(400).json({ error: "Malformed API Request" });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to verify ReCaptcha token" });
  }
};

export default middleware([cors({ allowedMethods: ["POST"] })], verifyReCaptchaToken);
