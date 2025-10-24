# Forms Test Setup utility

This tool automates the setup of **forms** (based on user-defined templates) and the generation of **submissions for those forms**.  
It was designed to support **large-scale load testing** of both the form-building web application and the data retrieval API.  

By combining reusable form templates with synthetic submissions — sent in parallel at configurable rates — developers can simulate realistic traffic patterns, validate scalability, and identify bottlenecks under heavy load.

## Features

- Generate forms from **custom templates**.
- Automatically publish forms and enable API access.
- Send **submissions** for each form.
- Output key information about created forms (form ID, API key, ...).
- Supports submission attachments (though there is only a small number of random generated files that will be pushed to S3 and referenced in all generated submissions).

## Prerequisites

- Node.js and Yarn installed.
- AWS credentials with appropriate access configured in your environment (you can get them from the CDS AWS access portal):
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_SESSION_TOKEN`

## Setup

1. **Install dependencies**

```bash
yarn install
```

2. **Create a config file**

Copy the example configuration:

```bash
cp example-config.json config.json
```

3. **Edit config.json**

Update the configuration according to your environment:

authjsCookie: Retrieve from Chrome inspector (Network tab) on a valid authenticated request sent to our Next.js server.

serverActionIdentifiers: Find server action identifiers in Chrome inspector (Sources tab) using the search bar.

vaultFileStorageS3BucketName: Find the bucket name using the AWS console (against the environment that you are looking to use).

templates: Provide a list of JSON-formatted form templates. The tool picks a random template for each new form.

numberOfForms: Number of forms to create.

publishForm: Set to true to automatically publish forms.

enableApiAccess: Set to true to automatically create an API key for each form.

numberOfResponses: Number of submissions per form.

## Usage

#### Setup resources (forms, submissions)

```bash
yarn test-setup
```

The tool will create forms and generate submissions according to your configuration.

When complete, an output.json file is generated in the root folder, containing details about created forms (formId, apiKey, usedTemplate).

#### Cleanup resources

Once you are done, remove all resources created during the setup.

```bash
yarn test-cleanup
```

The tool uses output.json to identify resources to delete (forms, submissions, API keys, ...).