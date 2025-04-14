# Release Testing

The purpose of this is to test the production environment with basic form submissions to give confidence the latest release is stable. 
The alternative is a manual test which is time consuming.

Run
```
yarn cypress:release-test
```

## Configuration 

Override the baseUrl with by setting the environment variable `CYPRESS_BASE_URL`. For example:
```
CYPRESS_BASE_URL=https://localhost:3000 cypress run --browser chrome --spec cypress/e2e/release-tests/form_submission.cy.ts
```

## Notes

Disable the form-timer check in `release-test.cy.ts`. Find the line with `const formTimer = true` and set it to `false`.
