import { NotifyClient } from "notifications-node-client";
import type { NextApiRequest, NextApiResponse } from "next";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import formidable from "formidable";
import fs from "fs";
import convertMessage from "@lib/markdown";
import { getFormByID, getSubmissionByID, rehydrateFormResponses } from "@lib/dataLayer";
import { logMessage } from "@lib/logger";
import { PublicFormSchemaProperties, Responses } from "@lib/types";
import { checkOne } from "@lib/flags";
import {uploadFileToS3,readStream2buffer} from "./s3-upload";

export const config = {
  api: {
    bodyParser: false,
  },
};

const lambdaClient = new LambdaClient({
  region: "ca-central-1",
  retryMode: "standard",
});

const submit = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  try {
    const incomingForm = new formidable.IncomingForm({ maxFileSize: 8000000 }); // Set to 8 MB and override default of 200 MB
    return incomingForm.parse(req, async (err, fields, files) => {
      console.log(" submit : " + fields);
      if (err) {
        throw new Error(err);
      }
      return await processFormData(fields, files, res, req).finally(() => {
        for (const [id] of Object.entries(files)) {
          const fileOrArray = files[id];
          if (Array.isArray(fileOrArray)) {
            fileOrArray.forEach((file) => {
              console.log(`File path to be deleted: ${file.path}`);
              fs.unlinkSync(file.path);
            });
          } else {
            let bucketName: string = process.env.AWS_BUCKET_NAME as string;
            readStream2buffer(fs.createReadStream(fileOrArray.path)).then(data=>{
              // saving file to S3 bucket
              uploadFileToS3(data, bucketName, fileOrArray.path).then(data => {

                console.log("File uploaded successfully :" + data);
               
                // Pass urls for saved files in S3 to Lambda Submission Function
                //if lambada function successfull 
                // log
                //if not success revoke and delete the file 

              }).catch(err => {
                console.error(err);
              });
  
              console.log(`File path to be deleted: ${fileOrArray.path}`);
              fs.unlinkSync(fileOrArray.path);
            }).catch(err=>{
              // Error could not upload to s3. 
              console.error("Error unable to upload a file:")

            });            
          }
        }
      });
    });
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

    // Add file S3 urls to payload once we start processing files through reliability queue
    // For now just attach the file names
    for (const [key, value] of Object.entries(files)) {
      const fileOrArray = value;
      if (!Array.isArray(fileOrArray)) {
        if (fileOrArray.name) {
          reqFields[key] = fileOrArray.name;
        }
      }
    }

    const form = await getFormByID(reqFields.formID as string);

    if (!form) {
      return res.status(400).json({ error: "No form could be found with that ID" });
    }

    const fields = rehydrateFormResponses({
      form,
      responses: reqFields,
    });

    // Staging or Production AWS environments
    if (submitToReliabilityQueue) {
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
    logMessage.error(err);
    return res.status(500).json({ received: false });
  }
};

export default submit;
