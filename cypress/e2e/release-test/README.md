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
"cypress:release-test": "CYPRESS_DEBUG=true CYPRESS_BASE_URL=https://localhost:3000 cypress run --config-file ./cypress-release-test.config.ts --browser chrome --spec cypress/e2e/release-test/release-test.cy.ts",
...
```

Update tests based on environment settings:
 - Disable the Form Timer in `release-test.cy.ts` line with `const formTimer = false`
 - Disable Submitting the form e.g. disable for captcha, in `release-test.cy.ts` line with `submitForm = false;`
