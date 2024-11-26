/* eslint-disable no-console */

import readline from "node:readline";
import filesystem from "node:fs/promises";
import { generateAccessToken } from "./accessTokenGenerator.js";
import { GCFormsApiClient } from "./gcFormsApiClient.js";
import { decryptFormSubmission } from "./formSubmissionDecrypter.js";
import { PrivateApiKey } from "./types.js";
import { verifyIntegrity } from "./formSubmissionIntegrityVerifier.js";

const EnvironmentVariables = {
  production: {
    identityProvider: "https://auth.forms-formulaires.alpha.canada.ca",
    projectId: "284778202772022819",
    gcFormsApi: "https://api.forms-formulaires.alpha.canada.ca",
  },
  staging: {
    identityProvider: "https://auth.forms-staging.cdssandbox.xyz",
    projectId: "275372254274006635",
    gcFormsApi: "https://api.forms-staging.cdssandbox.xyz",
  },
};

function getValue(query: string) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<string>((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      console.clear();
      resolve(ans);
    })
  );
}

const twirlTimer = () => {
  var P = ["\\", "|", "/", "-"];
  var x = 0;
  return setInterval(function () {
    process.stdout.write("\r" + P[x++]);
    x &= 3;
  }, 250);
};

async function loadPrivateApiKey(): Promise<PrivateApiKey> {
  return filesystem
    .readdir(".")
    .then((files) => {
      const validFiles = files.filter((fileName) => fileName.endsWith("_private_api_key.json"));

      if (validFiles.length !== 1) {
        throw new Error(
          "Private API key file is either missing or there is more than one in the directory"
        );
      }

      return validFiles[0];
    })
    .then((privateApiKeyFileName) => {
      return filesystem.readFile(`./${privateApiKeyFileName}`, {
        encoding: "utf8",
      });
    })
    .then((privateKeyAsJsonString) => {
      return JSON.parse(privateKeyAsJsonString) as PrivateApiKey;
    })
    .catch((error) => {
      throw new Error("Failed to load private API key", { cause: error });
    });
}

const main = async () => {
  try {
    const privateApiKey = await loadPrivateApiKey();
    let menuSelection = "";

    // Makes it pretteir to interact with
    console.clear();

    const environmentSelection = await getValue(`Which application Environment are you using?
(1) Production
(2) Staging
Selection (2):  `);

    menuSelection = await getValue(`I want to:
(1) Retrieve form submissions
(2) Generate and display an Access Token
Selection (1):  `);

    const { identityProvider, projectId, gcFormsApi } =
      environmentSelection === "1" ? EnvironmentVariables.production : EnvironmentVariables.staging;

    const accessToken = await generateAccessToken(identityProvider, projectId, privateApiKey);

    if (menuSelection === "2") {
      console.info(`Access Token: \n${accessToken}`);
      return;
    }

    const apiClient = new GCFormsApiClient(privateApiKey.formId, gcFormsApi, accessToken);

    const formTemplate = await apiClient.getFormTemplate();

    console.info("Form Template:", formTemplate);

    const newSubmissionNames = await apiClient.getNewFormSubmissions();

    menuSelection =
      await getValue(`${newSubmissionNames.length} new submissions found. How many do you want to retrieve?
Type a number or 'all':  `);

    const downloadAll =
      isNaN(parseInt(menuSelection, 10)) ??
      parseInt(menuSelection, 10) >= newSubmissionNames.length;

    // Show user something is happening
    console.info(`Retrieving ${downloadAll ? "all" : menuSelection} submissions...`);
    const twirler = twirlTimer();

    const namesToRetrieve = downloadAll
      ? newSubmissionNames
      : newSubmissionNames.slice(0, parseInt(menuSelection, 10));

    const submissions = await Promise.all(
      namesToRetrieve.map(async (newSubmission) => {
        const encryptedSubmission = await apiClient.getFormSubmission(newSubmission.name);
        const decryptedSubmission = decryptFormSubmission(encryptedSubmission, privateApiKey);
        const submission = JSON.parse(decryptedSubmission);
        const integrity = verifyIntegrity(submission.answers, submission.checksum);
        return { integrity, submission };
      })
    ).then((results) => {
      return new Map(results.map((result, index) => [namesToRetrieve[index].name, result]));
    });

    clearInterval(twirler);
    console.clear();

    console.info(`Retrieved ${submissions.size} submissions:`);
    submissions.forEach((value, key) => {
      console.info(`Submission: ${key} // Integrity: ${value.integrity ? "Verified" : "Failed"}`);
    });

    menuSelection = await getValue(`Do you want to confirm any submissions? (y/n):  `);
    if (menuSelection === "n") {
      return;
    }

    menuSelection = await getValue(`How many submissions do you want to confirm?
  Type a number or 'all':  `);
    const confirmAll =
      isNaN(parseInt(menuSelection, 10)) ?? parseInt(menuSelection, 10) >= submissions.size;

    const submissionsToConfirm = confirmAll
      ? Array.from(submissions.keys())
      : Array.from(submissions.keys()).slice(0, parseInt(menuSelection, 10));

    const result = await Promise.all(
      submissionsToConfirm.map(async (submissionName) => {
        const confirmationCode = submissions.get(submissionName)?.submission.confirmationCode;

        if (!confirmationCode) {
          throw new Error(`Confirmation code not found for submission: ${submissionName}`);
        }
        return apiClient.confirmFormSubmission(submissionName, confirmationCode);
      })
    );

    console.info(`Confirmed ${result.length} submissions:`);
  } catch (e) {
    console.error(e);
  }
};

main();
