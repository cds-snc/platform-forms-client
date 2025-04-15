# Release Testing

The purpose of this is to test the production environment with basic form submissions to give confidence the latest release is stable. 
The alternative is a manual test which is time consuming.

Run
```
yarn cypress:release-test
```

## Configuration 

Override the baseUrl with by setting the environment variable `CYPRESS_BASE_URL`. 
For example in package.json add:
```
...
"cypress:release-test": "CYPRESS_DEBUG=true CYPRESS_BASE_URL=https://forms-staging.cdssandbox.xyz cypress run --config-file ./cypress/release-test/cypress.config.ts --browser chrome",
...
```

Update tests based on environment settings:
 - Disable the Form Timer in `cypress/release-test/includes.ts` and update line `const formTimer = false`
 - Disable Submitting the form e.g. disable for captcha, in `cypress/release-test/includes.ts` and update line `submitForm = false;`
