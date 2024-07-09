import express, { RequestHandler } from "express";

const app = express();

const randomSleepInMs = (min: number, max: number) => {
  return new Promise((resolve) =>
    setTimeout(resolve, Math.floor(Math.random() * (max - min + 1) + min))
  );
};

function objectAsPartialJSON(obj: any) {
  const objAsJson = JSON.stringify(obj);
  return objAsJson.substring(1, objAsJson.length - 1);
}

function objectAsCompleteJSON(obj: any) {
  return JSON.stringify(obj);
}

const startJsonResponse: RequestHandler = (_, res, next) => {
  res.setHeader("Content-Type", "application/stream+json");
  res.write("{");
  next();
};

const newPropertyJsonMarker: RequestHandler = (_, res, next) => {
  res.write(",");
  next();
};

function startArrayJsonMarker(propertyName: string): RequestHandler {
  return async (_, res, next) => {
    res.write(`"${propertyName}": [`);
    next();
  };
}

const endArrayJsonMarker: RequestHandler = (_, res, next) => {
  res.write("]");
  next();
};

const sendSubmission: RequestHandler = async (req, res, next) => {
  const submissionId = req.params.id;

  const partialJson = objectAsPartialJSON({
    submissionId,
    formId: "clxng8eb700015h2z9x3pjcof",
    name: "20-06-e097",
    confirmationCode: "ccc0e4c1-4912-4e07-86b6-44e741086a6d",
    createdAt: 1718899831595,
    formSubmission: '{"1":"b","2":"","3":"","4":"b1","5":"b2","6":["checkbox-1","checkbox-3"]}',
    formSubmissionHash: "4706a61a83c844d58648ca2c7a420280",
    formSubmissionLanguage: "en",
    securityAttribute: "Protected A",
    status: "New",
  });

  // Simulate internal API call delay
  await randomSleepInMs(25, 50);

  res.write(partialJson);

  next();
};

function sendAttachedFile(attachmentName: string): RequestHandler {
  return async (_, res, next) => {
    const fakeAttachmentAsBinaryData = Buffer.alloc(3145728);

    const completeJson = objectAsCompleteJSON({
      attachmentName,
      sizeInBytes: fakeAttachmentAsBinaryData.length,
      base64EncodedFile: fakeAttachmentAsBinaryData.toString("base64"),
    });

    // Simulate internal API call delay
    await randomSleepInMs(25, 50);

    res.write(completeJson);

    next();
  };
}

function sendAttachedFiles(): RequestHandler[] {
  return [
    startArrayJsonMarker("attachments"),
    sendAttachedFile("attachment1.txt"),
    newPropertyJsonMarker,
    sendAttachedFile("attachment2.jpg"),
    endArrayJsonMarker,
  ];
}

const endJsonResponse: RequestHandler = (_, res, __) => {
  res.write("}");
  res.end();
};

app.get(
  "/get-submission/:id",
  [
    startJsonResponse,
    sendSubmission,
    newPropertyJsonMarker,
    sendAttachedFiles(),
    endJsonResponse,
  ].flat()
);

// Simple endpoint to show that Express has a built in `sendFile` function
app.get("/file", (_, res) => {
  res.sendFile(__dirname + "/index.ts");
});

app.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000`);
});
