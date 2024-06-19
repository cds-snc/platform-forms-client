/* eslint-disable no-console */

import { config } from "dotenv";
import axios from "axios";
import readline from "readline";
import * as jose from "jose";
import gcformsPrivate from "./gcForms_private_api_key.json";
import crypto from "crypto";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const twirlTimer = () => {
  var P = ["\\", "|", "/", "-"];
  var x = 0;
  return setInterval(function () {
    process.stdout.write("\r" + P[x++]);
    x &= 3;
  }, 250);
};

function getValue(query: string) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<string>((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

const getAccessToken = async () => {
  const alg = "RS256";
  const privateKey = crypto.createPrivateKey({ key: gcformsPrivate.key });
  const serviceUserId = gcformsPrivate.userId;
  const kid = gcformsPrivate.keyId;

  const jwt = await new jose.SignJWT()
    .setProtectedHeader({ alg, kid })
    .setIssuedAt()
    .setIssuer(serviceUserId)
    .setSubject(serviceUserId)
    .setAudience(process.env.IDENTITY_PROVIDER ?? "")
    .setExpirationTime("1h")
    .sign(privateKey);

  return axios
    .post(
      `${process.env.IDENTITY_PROVIDER}/oauth/v2/token`,
      new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
        scope: "openid profile urn:zitadel:iam:org:project:id:269559550980390914:aud",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
    .then((res) => res.data.access_token)
    .catch((e) => {
      console.error(e.response);
    });
};

const main = async () => {
  try {
    const identityProvider = process.env.IDENTITY_PROVIDER;

    if (!identityProvider) {
      throw new Error("Identity provider not set in .env file");
    }

    const formID = await getValue("Form ID to retrieve responses for: ");
    const accessToken = await getAccessToken();

    const data = await axios
      .get(`${process.env.GCFORMS_URL}/api/id/${formID}/submission/retrieve`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      })
      .then((res) => res.data)
      .catch((e) => {
        console.error(e.response.data);
      });

    const { encryptedResponses, encryptedIV, encryptedKey, encryptedAuthTag } = data;
    console.log(
      `Encrypted Responses: ${Buffer.from(encryptedResponses, "base64").toString("base64")}`
    );
    console.log("Decrypting responses.");
    const privateKey = crypto.createPrivateKey({ key: gcformsPrivate.key });

    const decryptedKey = crypto.privateDecrypt(privateKey, Buffer.from(encryptedKey, "base64"));

    const decryptedIV = crypto.privateDecrypt(privateKey, Buffer.from(encryptedIV, "base64"));
    const authTag = crypto.privateDecrypt(privateKey, Buffer.from(encryptedAuthTag, "base64"));

    const decipher = crypto.createDecipheriv("aes-256-gcm", decryptedKey, decryptedIV);
    decipher.setAuthTag(authTag);

    const responses = Buffer.concat([
      decipher.update(Buffer.from(encryptedResponses, "base64")),
      decipher.final(),
    ]);

    console.log(responses.toString("utf-8"));
  } catch (e) {
    console.log(e);
  }
};

// config() adds the .env variables to process.env
config();

main();
