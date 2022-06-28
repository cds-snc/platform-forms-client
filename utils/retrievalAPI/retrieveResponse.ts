/* eslint-disable no-console */
import readline from "readline";
import axios from "axios";
import { createObjectCsvWriter } from "csv-writer";

const formsUrl = "http://localhost:3000";

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

interface formResponse {
  formID: string;
  submissionID: string;
  formSubmission: string;
}

async function getResponses(
  formID: string,
  temporaryToken: string
): Promise<{ responses: Array<formResponse> }> {
  try {
    const formResponses = await axios({
      method: "GET",
      url: `${formsUrl}/api/id/${formID}/retrieval`,
      headers: {
        authorization: `Bearer ${temporaryToken}`,
      },
      timeout: 20000,
    });
    return formResponses.data;
  } catch (e) {
    console.log("Error retrieving responses");
    throw e;
  }
}

async function saveResponses(responses: Array<formResponse>) {
  const qIds = Object.keys(JSON.parse(responses[0].formSubmission)).map((q, index) => ({
    id: q,
    title: `question ${index}`,
  }));
  const csvWriter = createObjectCsvWriter({
    path: "responses.csv",
    header: qIds,
  });

  await csvWriter.writeRecords(responses.map((response) => JSON.parse(response.formSubmission)));
}

async function confirmResponses(responses: Array<string>, formID: string, temporaryToken: string) {
  try {
    await axios({
      method: "delete",
      url: `${formsUrl}/api/id/${formID}/retrieval`,
      headers: {
        authorization: `Bearer ${temporaryToken}`,
      },
      data: responses,
      timeout: 20000,
    });
  } catch (e) {
    console.log("Error retrieving responses");
    throw e;
  }
}

const main = async () => {
  try {
    const email = await getValue("Email address to authenticate with:");
    const formID = await getValue("Form ID of responses to retrieve:");
    let temporaryTokenExists = "";
    while (!["y", "n"].includes(temporaryTokenExists)) {
      temporaryTokenExists = await getValue("Do you already have a valid temporary token? (y/n)");
    }

    if (temporaryTokenExists === "n") {
      const bearer = await getValue(`Bearer Token for form id ${formID}:`);
      console.log("Generating Temporary Token...");
      // Generate Temporary Token
      axios({
        method: "post",
        url: `${formsUrl}/api/token/temporary`,
        headers: {
          authorization: `Bearer ${bearer}`,
        },
        data: {
          email,
        },
        timeout: 10000,
      }).catch((error) => {
        console.log("Could not generate temporary token");
        throw error;
      });

      console.log(`Please check email ${email} for tempoary token`);
    }

    const temporaryToken = await getValue("Temporary Token:");
    let allResponsesRetrieved = false;
    let totalResponses = 0;

    // Retrieve Responses

    let continueWithRetrieval = "";
    while (!["y", "n"].includes(continueWithRetrieval)) {
      continueWithRetrieval = await getValue(
        "By continuing you accept that responses will be downloaded and removed from GC Forms System? (y/n)"
      );
    }

    if (continueWithRetrieval === "n") {
      console.log("Cancelling retrieval and exiting.");
      return;
    }

    while (!allResponsesRetrieved) {
      console.log("Retrieving responses...");
      const { responses } = await getResponses(formID, temporaryToken);
      totalResponses += responses.length;
      if (responses.length > 0) {
        console.log("Saving Responses...");
        await saveResponses(responses);
        await confirmResponses(
          responses.map((response) => response.submissionID),
          formID,
          temporaryToken
        );
      }
      if (responses.length < 10) {
        allResponsesRetrieved = true;
      }
    }
    console.log(`Retrieval complete.  Retrieved ${totalResponses} responses.`);
  } catch (e) {
    console.log(e);
  }
};

main();
