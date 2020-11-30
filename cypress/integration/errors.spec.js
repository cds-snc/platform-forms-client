const route = (name, lang) =>
  require('../../utils/route.helpers').simpleRoute(name, lang, true)
/* eslint-disable no-undef */
function testError(name, lang, numberOfExpectedErrors) {
  const numErrors = numberOfExpectedErrors || 1
  const path = route(name, lang)

  cy.visit(path)
  cy.get('[data-cy=next]').click()
  cy.get('[data-cy=errors]').children().should('have.length', numErrors)
  cy.reportA11y()
}

describe('Error Pages', () => {
  ['en', 'fr'].forEach((lang) => {
    describe('Language: ' + lang, () => {
      beforeEach(() => {
        process.env.COOKIE_SECRET = 'error_pages'
      })

      it('Province', () => {
        testError('question-province', lang)
      })

      it('Lost Job', () => {
        testError('question-lost-job', lang)
      })

      it('No Income', () => {
        testError('question-your-situation-no-income', lang)
      })

      it('Some Income', () => {
        testError('question-your-situation-some-income')
      })

      it('Unchanged Income', () => {
        testError('question-your-situation-unchanged-income', lang)
      })

      it('Mortgage Payments', () => {
        testError('question-mortgage-payments', lang)
      })

      it('CCB', () => {
        testError('question-ccb', lang)
      })

      it('Student Debt', () => {
        testError('question-student-debt', lang)
      })

      it('OAS', () => {
        testError('question-oas', lang)
      })

      it('RRIF', () => {
        testError('question-rrif', lang)
      })

      it('Gross Income', () => {
        testError('question-gross-income', lang)
      })

      it('Reduced Income', () => {
        testError('question-reduced-income', lang)
      })
      it('DTC', () => {
        testError('question-dtc', lang)
      })
    })
  })
})
