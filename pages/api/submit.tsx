import { NotifyClient } from "notifications-node-client";
import type { NextApiRequest, NextApiResponse } from "next";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import formidable, { Fields, Files } from "formidable";
import convertMessage from "@lib/markdown";
import { getFormByID, getSubmissionByID, rehydrateFormResponses } from "@lib/dataLayer";
import { logMessage } from "@lib/logger";
import { PublicFormSchemaProperties, Responses } from "@lib/types";
import { checkOne } from "@lib/flags";
import { pushFileToS3, deleteObject } from "@lib/s3-upload";
import axios, { AxiosResponse } from "axios";

export const config = {
  api: {
    bodyParser: false,
  },
};

type CheckboxValue = {
  value: Array<string>;
};

type IRCCConfig = {
  forms: Array<number>;
  programFieldID: number;
  languageFieldID: number;
  contactFieldID: number;
  listMapping: Record<string, Record<string, Record<string, string>>>;
};

const lambdaClient = new LambdaClient({
  region: "ca-central-1",
  retryMode: "standard",
});

const submit = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void | NodeJS.Timeout> => {
  try {
    const incomingForm = new formidable.IncomingForm({ maxFileSize: 8000000 }); // Set to 8 MB and override default of 200 MB
    // we have to return a response for the NextJS handler. So we create a Promise which will be resolved
    // with the data from the IncomingForm parse callback
    const data = (await new Promise(function (resolve, reject) {
      incomingForm.parse(req, (err, fields, files) => {
        if (err) {
          reject(err);
        }
        resolve({ fields, files });
      });
    })) as
      | {
          fields: Fields;
          files: Files;
        }
      | string;

    if (typeof data === "string") {
      throw new Error(data);
    }
    return await processFormData(data.fields as Fields, data.files as Files, res, req);
  } catch (err) {
    logMessage.error(err);
    return res.status(500).json({ received: false });
  }
};

const callLambda = async (formID: string, fields: Responses) => {
  const submission = await getSubmissionByID(formID);

  const encoder = new TextEncoder();

  const command = new InvokeCommand({
    FunctionName: process.env.SUBMISSION_API ?? "Submission",
    Payload: encoder.encode(
      JSON.stringify({
        formID,
        responses: fields,
        submission,
      })
    ),
  });
  return await lambdaClient
    .send(command)
    .then((response) => {
      const decoder = new TextDecoder();
      const payload = decoder.decode(response.Payload);
      if (response.FunctionError || !JSON.parse(payload).status) {
        throw Error("Submission API could not process form response");
      } else {
        logMessage.info("Submission Lambda Client successfully triggered");
      }
    })
    .catch((err) => {
      logMessage.error(err);
      throw new Error("Could not process request with Lambda Submission function");
    });
};

const previewNotify = async (form: PublicFormSchemaProperties, fields: Responses) => {
  const templateID = "92096ac6-1cc5-40ae-9052-fffdb8439a90";
  const notify = new NotifyClient(
    "https://api.notification.canada.ca",
    process.env.NOTIFY_API_KEY ?? "thisIsATestKey"
  );

  const emailBody = await convertMessage({ form, responses: fields });
  const messageSubject = form.emailSubjectEn ? form.emailSubjectEn : form.titleEn;
  return await notify
    .previewTemplateById(templateID, {
      subject: messageSubject,
      formResponse: emailBody,
    })
    .then((response: { data: { html: string } }) => {
      return response.data.html;
    })
    .catch((err: Error) => {
      logMessage.error(err);
      return "<h1>Could not preview HTML / Error in processing </h2>";
    });
};

const processFormData = async (
  reqFields: Responses | undefined,
  files: formidable.Files,
  res: NextApiResponse,
  req: NextApiRequest
) => {
  const uploadedFilesKeyUrlMapping: Map<string, string> = new Map();
  try {
    const submitToReliabilityQueue = await checkOne("submitToReliabilityQueue");
    const notifyPreview = await checkOne("notifyPreview");

    if (!reqFields) {
      return res.status(400).json({ error: "No form submitted with request" });
    }

    logMessage.info(
      `Path: ${req.url}, Method: ${req.method}, Form ID: ${
        reqFields ? reqFields.formID : "No form attached"
      }`
    );

    if (process.env.CYPRESS) {
      logMessage.info("Not Sending to Backend Processing - Test mode");
      return await setTimeout(() => res.status(200).json({ received: true }), 1000);
    }

    // get ircc configuration file from env variable. This is a base64 encoded string
    const irccConfig: IRCCConfig = JSON.parse(
      Buffer.from(process.env.IRCC_CONFIG || "", "base64").toString()
    );

    const listManagerHost = process.env.LIST_MANAGER_HOST;

    const listManagerApiKey = process.env.LIST_MANAGER_API_KEY;

    const form = await getFormByID(reqFields.formID as string);

    if (!form) {
      return res.status(400).json({ error: "No form could be found with that ID" });
    }

    const fields = rehydrateFormResponses({
      form,
      responses: reqFields,
    });

    // if the ircc config is defined and the form id matches the array of forms specified. Then we send to the list manager
    // not the reliability queue. Otherwise we send to the normal reliability queue
    if (
      listManagerHost &&
      listManagerApiKey &&
      irccConfig &&
      irccConfig.forms &&
      irccConfig.forms.includes(parseInt(reqFields.formID as string))
    ) {
      return await submitToListManagementAPI(
        irccConfig,
        listManagerHost,
        listManagerApiKey,
        reqFields,
        form,
        req,
        res
      );
    }
    // Staging or Production AWS environments
    else if (submitToReliabilityQueue) {
      for (const [_key, value] of Object.entries(files)) {
        const fileOrArray = value;
        if (!Array.isArray(fileOrArray)) {
          if (fileOrArray.name) {
            logMessage.info(`uploading: ${_key} - filename ${fileOrArray.name} `);
            const { isValid, key } = await pushFileToS3(fileOrArray);
            if (isValid) {
              uploadedFilesKeyUrlMapping.set(fileOrArray.name, key);
              fields[_key] = key;
            }
          }
        } else if (Array.isArray(fileOrArray)) {
          // An array will be returned in a field that includes multiple files
          fileOrArray.forEach(async (fileItem, index) => {
            if (fileItem.name) {
              logMessage.info(`uploading: ${_key} - filename ${fileItem.name} `);
              const { isValid, key } = await pushFileToS3(fileItem);
              if (isValid) {
                uploadedFilesKeyUrlMapping.set(fileItem.name, key);
                fields[`${_key}-${index}`] = key;
              }
            }
          });
        }
      }
      return await callLambda(form.formID, fields)
        .then(async () => {
          if (notifyPreview) {
            await previewNotify(form, fields).then((response) => {
              return res.status(201).json({ received: true, htmlEmail: response });
            });
          } else {
            return res.status(201).json({ received: true });
          }
        })
        .catch((err) => {
          logMessage.error(err);
          return res.status(500).json({ received: false });
        });
    }
    // Local development and Heroku
    else if (notifyPreview) {
      return await previewNotify(form, fields).then((response) => {
        return res.status(201).json({ received: true, htmlEmail: response });
      });
    }
    // Set this to a 200 response as it's valid if the send to reliability queue option is off.
    return res.status(200).json({ received: true });
  } catch (err) {
    // it is true if file(s) has/have been already uploaded.It'll try a deletion of the file(s) on S3.
    if (uploadedFilesKeyUrlMapping.size > 0) {
      uploadedFilesKeyUrlMapping.forEach(async (value, key) => {
        logMessage.info(`deletion of key : ${key}  -  value: ${value}`);
        await deleteObject(key);
      });
    }
    logMessage.error(err);
    return res.status(500).json({ received: false });
  }
};

const submitToListManagementAPI = async (
  irccConfig: IRCCConfig,
  listManagerHost: string,
  listManagerApiKey: string,
  reqFields: Responses,
  form: PublicFormSchemaProperties,
  req: NextApiRequest,
  res: NextApiResponse
) => {
  // get program and language values from submission using the ircc config refrenced ids
  const programs = JSON.parse(reqFields[irccConfig.programFieldID] as string) as CheckboxValue;
  const programList = programs.value;

  const languages = JSON.parse(reqFields[irccConfig.languageFieldID] as string) as CheckboxValue;

  const languageList = languages.value;

  const contact = reqFields[irccConfig.contactFieldID] as string;

  // get the type of contact field from the form template
  const contactFieldFormElement = form.elements.filter(
    (value) => value.id === irccConfig.contactFieldID
  );

  const contactFieldType =
    contactFieldFormElement.length > 0
      ? contactFieldFormElement[0].properties.validation?.type
      : false;

  if (contactFieldType) {
    // forEach slower than a for loop https://stackoverflow.com/questions/43821759/why-array-foreach-is-slower-than-for-loop-in-javascript
    // yes its a double loop O(n^2) but we know n <= 4
    for (let i = 0; i < languageList.length; i++) {
      for (let j = 0; j < programList.length; j++) {
        const language = languageList[i];
        const program = programList[j];
        let listID;
        // try getting the list id from the config json. If it doesn't exist fail gracefully, log the message and send 500 error
        // 500 error because this is a misconfiguration on our end its not the users fault i.e. 4xx
        try {
          listID = irccConfig.listMapping[language][program][contactFieldType];
        } catch (e) {
          logMessage.error(
            `IRCC config does not contain the following path ${language}.${program}.${contactFieldType}`
          );
          return res.status(500).json({ received: false });
        }

        let response: AxiosResponse;
        try {
          // Now we create the subscription
          response = await axios.post(
            `${listManagerHost}/subscription`,
            {
              [contactFieldType]: contact,
              list_id: listID,
            },
            {
              headers: {
                Authorization: listManagerApiKey,
              },
            }
          );
        } catch (e) {
          logMessage.error(e);
          return res.status(500).json({ received: false });
        }

        // subscription is successfully created... log the id and return 200
        if (response.status === 200) {
          logMessage.info(`Subscription created with id: ${response.data.id}`);
        }
        // otherwise something has failed... not the users issue hence 500
        else {
          logMessage.error(
            `Subscription failed with status ${response.status} and message ${response.data}`
          );
          return res.status(500).json({ received: false });
        }
      }
    }
    return res.status(200).json({ received: true });
  } else {
    logMessage.error(
      `Not able to determine type of contact field for form ${reqFields.formID as string}`
    );
    return res.status(400).json({
      error: `Not able to determine type of contact field for form ${reqFields.formID as string}`,
    });
  }
};

export default submit;
