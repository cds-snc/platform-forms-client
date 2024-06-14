import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { AccessControlError } from "@lib/privileges";
import gcforms_api from "./api_key.json";
import crypto from "crypto";
import * as jose from "jose";
import axios from "axios";
import { logMessage } from "@lib/logger";
import { prisma } from "@lib/integration/prismaConnector";

const introspectionEndpoint = `${process.env.ZITADEL_ISSUER}/oauth/v2/introspect`;

const mockResponses = [
  {
    id: "04-06-6d28",
    createdAt: "2024-06-04T18:58:13.877Z",
    answers: [
      { questionId: 1, type: "radio", questionEn: "Are you Bryan?", questionFr: "", answer: "Yes" },
    ],
  },
  {
    id: "04-06-412e",
    createdAt: "2024-06-04T18:58:22.768Z",
    answers: [
      { questionId: 1, type: "radio", questionEn: "Are you Bryan?", questionFr: "", answer: "No" },
    ],
  },
];

export const GET = async (req: NextRequest, { params }: { params: { form: string } }) => {
  try {
    const formId = params.form;
    const headersList = headers();
    const bearerToken = headersList.get("authorization");

    if (!bearerToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = bearerToken.split(" ")[1];
    if (!accessToken) {
      return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
    }

    logMessage.debug(accessToken);

    // Check access token with Zitadel
    const privateKey = crypto.createPrivateKey({ key: gcforms_api.key });
    const clientId = gcforms_api.clientId;
    const kid = gcforms_api.keyId;
    const alg = "RS256";

    const jwt = await new jose.SignJWT()
      .setProtectedHeader({ alg, kid })
      .setIssuedAt()
      .setIssuer(clientId)
      .setSubject(clientId)
      .setAudience(process.env.ZITADEL_ISSUER ?? "")
      .setExpirationTime("5m")
      .sign(privateKey);

    const tokenData = await axios
      .post(
        introspectionEndpoint,
        new URLSearchParams({
          client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
          client_assertion: jwt,
          token: accessToken,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )
      .then((res) => res.data)
      .catch((err) => {
        logMessage.error(err.response.data);
        return null;
      });
    const { username, exp } = tokenData;

    // Ensure formId from token (user name) and path match
    if (username !== formId) {
      return NextResponse.json({ error: "Token is not for this Form ID" }, { status: 403 });
    }
    // Check expiry

    if (exp < Date.now() / 1000) {
      return NextResponse.json({ error: "Token is Expired" }, { status: 403 });
    }
    // retrive responses from dynamoDB

    // If responses get public key for encryption using key ID from forms db

    const { publicKey: key } =
      (await prisma.apiServiceAccount.findUnique({
        where: {
          templateId: formId,
        },
        select: {
          publicKey: true,
        },
      })) ?? {};

    if (!key) {
      return NextResponse.json({ error: "No Public Key on Record" }, { status: 400 });
    }

    // encrypt response

    const encryptionKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);

    const encryptedResponses = Buffer.concat([
      cipher.update(Buffer.from(JSON.stringify(mockResponses))),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    const publicKey = crypto.createPublicKey({ key });
    const encryptedKey = crypto.publicEncrypt(publicKey, encryptionKey).toString("base64");
    const encryptedIV = crypto.publicEncrypt(publicKey, iv).toString("base64");
    const encryptedAuthTag = crypto.publicEncrypt(publicKey, authTag).toString("base64");

    return NextResponse.json({
      formId,
      encryptedResponses,
      encryptedKey,
      encryptedIV,
      encryptedAuthTag,
    });
  } catch (err) {
    logMessage.error(err);
    if (err instanceof AccessControlError)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    else
      return NextResponse.json(
        { error: "There was an error. Please try again later." },
        { status: 500 }
      );
  }
};
