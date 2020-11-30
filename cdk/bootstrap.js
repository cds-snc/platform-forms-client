// import environment variables.
require('dotenv').config({ path: '../.env' })

const exec = require('child_process').exec
const path = require('path')

process.env.AWS_SHARED_CREDENTIALS_FILE = path.resolve(
  __dirname,
  '../credentials',
)

const awsAccountId = process.env.AWS_ACCOUNT_ID

exec(
  `cdk bootstrap aws://${awsAccountId}/ca-central-1 -v`,
  { env: process.env },
  (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`)
      return
    }
    console.log(`stdout: ${stdout}`)
    console.log(`stderr: ${stderr}`)
  },
)
