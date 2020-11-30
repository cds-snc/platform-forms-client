const route = (name, lang) => require('../../utils/route.helpers').simpleRoute(name, lang, true);

/* eslint-disable no-undef */
describe('Result Page Only tests', () => {
  ['en', 'fr'].forEach((lang) => {
    describe('Language: ' + lang, () => {

      beforeEach(() => {
        process.env.COOKIE_SECRET = 'result'
      })

      it('should display an error when navigating directly to results page', () => {
        cy.visit(route('results', lang))
        cy.get('[data-cy=missed-questions]')
        cy.reportA11y()
      })

      it('should display GST Benefit no matter what', () => {
        cy.visit(route('results', lang))
        cy.get('#gst_credit')
        cy.reportA11y()
      })
    })
  })
})

function provinceLookup(key, locale){
  return {
    'on': {'en': 'Ontario', 'fr': 'Ontario'},
  }[key][locale];
}
describe('Paths and Benefits', () => {
  ['en', 'fr'].forEach((lang) => {
    describe('Language: ' + lang, () => {

      beforeEach(() => {
        process.env.COOKIE_SECRET = 'paths'
        cy.visit('/' + lang)
        cy.reportA11y()
        cy.get('[data-cy=start]').click()
      })

      it('EI Sickness CERB, Mortgage, Student Loans, CCB', () => {
        cy.answerInput('#province-select',provinceLookup('on',lang))
        cy.answerRB('#lost_joblost-all-income')
        cy.answerRB('#no_incomesick-or-quarantined')
        cy.answerRB('#mortgage_paymentsyes-mortgage')
        cy.answerRB('#ccbyes')
        cy.answerRB('#student_debtyes')
        cy.answerRB('#plans_for_schoolno')
        cy.answerRB('#oasno')
        cy.answerRB('#dtcno')
        cy.reportA11y()
        cy.get('[data-cy=eligible-benefit-list]').children().should('have.length', '4')
        cy.get('#cerb')
        cy.get('#mortgage_deferral')
        cy.get('#student_loan')
        cy.get('#ccb_payment')
      })

      it('CERB', () => {
        cy.answerInput('#province-select',provinceLookup('on',lang))
        cy.answerRB('#lost_joblost-all-income')
        cy.answerRB('#no_incomeself-employed-closed')
        cy.answerRB('#mortgage_paymentsno')
        cy.answerRB('#ccbno')
        cy.answerRB('#student_debtno')
        cy.answerRB('#plans_for_schoolno')
        cy.answerRB('#oasno')
        cy.answerRB('#dtcno')
        cy.reportA11y()
        cy.get('[data-cy=eligible-benefit-list]').children().should('have.length', '1')
        cy.get('#cerb')
      })

      it('EI Regular Cerb', () => {
        cy.answerInput('#province-select',provinceLookup('on',lang))
        cy.answerRB('#lost_joblost-some-income')
        cy.answerRB('#some_incomehours-reduced')
        cy.answerRB('#reduced_income1000_or_less')
        cy.answerRB('#mortgage_paymentsno')
        cy.answerRB('#ccbno')
        cy.answerRB('#student_debtno')
        cy.answerRB('#plans_for_schoolno')
        cy.answerRB('#oasno')
        cy.answerRB('#dtcno')
        cy.reportA11y()
        cy.get('[data-cy=eligible-benefit-list]').children().should('have.length', '1')
        cy.get('#cerb')
      })

      it('RRIF', () => {
        cy.answerInput('#province-select',provinceLookup('on',lang))
        cy.answerRB('#lost_joblost-some-income')
        cy.answerRB('#some_incomeretired')
        cy.answerRB('#gross_income4999_or_less')
        cy.answerRB('#rrifyes')
        cy.answerRB('#mortgage_paymentsno')
        cy.answerRB('#ccbno')
        cy.answerRB('#student_debtno')
        cy.answerRB('#plans_for_schoolno')
        cy.answerRB('#oasno')
        cy.answerRB('#dtcno')
        cy.reportA11y()
        cy.get('[data-cy=eligible-benefit-list]').children().should('have.length', '1')
        cy.get('#rrif')
      })

      it('OAS', () => {
        cy.answerInput('#province-select',provinceLookup('on',lang))
        cy.answerRB('#lost_joblost-some-income')
        cy.answerRB('#some_incomeretired')
        cy.answerRB('#gross_income4999_or_less')
        cy.answerRB('#rrifno')
        cy.answerRB('#mortgage_paymentsno')
        cy.answerRB('#ccbno')
        cy.answerRB('#student_debtno')
        cy.answerRB('#plans_for_schoolno')
        cy.answerRB('#oasoas')
        cy.answerRB('#dtcno')
        cy.reportA11y()
        cy.get('[data-cy=eligible-benefit-list]').children().should('have.length', '1')
        cy.get('#oas')
      })

      it('Rent Help, Student Financial Aid', () => {
        cy.answerInput('#province-select',provinceLookup('on',lang))
        cy.answerRB('#lost_joblost-no-income')
        cy.answerRB('#unchanged_incomestudent_2019_20')
        cy.answerRB('#mortgage_paymentsyes-rent')
        cy.answerRB('#ccbno')
        cy.answerRB('#student_debtno')
        cy.answerRB('#plans_for_schoolyes')
        cy.answerRB('#oasno')
        cy.answerRB('#dtcno')
        cy.reportA11y()
        cy.get('[data-cy=eligible-benefit-list]').children().should('have.length', '3')
        cy.get('#rent_help')
        cy.get('#cesb')
        cy.get('#student_financial_aid')
      })

      it('dtc-alone', () => {
        cy.answerInput('#province-select',provinceLookup('on',lang))
        cy.answerRB('#lost_joblost-no-income')
        cy.answerRB('#unchanged_incomenone-of-the-above')
        cy.answerRB('#mortgage_paymentsno')
        cy.answerRB('#ccbno')
        cy.answerRB('#student_debtno')
        cy.answerRB('#plans_for_schoolno')
        cy.answerRB('#oasno')
        cy.answerRB('#dtcyourself')
        cy.get('[data-cy=eligible-benefit-list]').children().should('have.length', '1')
        cy.get('#dtc')
      })

      it('dtc-child', () => {
        cy.answerInput('#province-select',provinceLookup('on',lang))
        cy.answerRB('#lost_joblost-no-income')
        cy.answerRB('#unchanged_incomenone-of-the-above')
        cy.answerRB('#mortgage_paymentsno')
        cy.answerRB('#ccbno')
        cy.answerRB('#student_debtno')
        cy.answerRB('#plans_for_schoolno')
        cy.answerRB('#oasno')
        cy.answerRB('#dtcchild')
        cy.get('[data-cy=eligible-benefit-list]').children().should('have.length', '1')
        cy.get('#dtc_child')
      })

      it('dtc-allowance', () => {
        cy.answerInput('#province-select',provinceLookup('on',lang))
        cy.answerRB('#lost_joblost-no-income')
        cy.answerRB('#unchanged_incomenone-of-the-above')
        cy.answerRB('#mortgage_paymentsno')
        cy.answerRB('#ccbno')
        cy.answerRB('#student_debtno')
        cy.answerRB('#plans_for_schoolno')
        cy.answerRB('#oasallowance')
        cy.answerRB('#dtcyourself')
        cy.get('[data-cy=eligible-benefit-list]').children().should('have.length', '2')
        cy.get('#dtc_allowance')
      })

      it('dtc-allowance-survivor', () => {
        cy.answerInput('#province-select',provinceLookup('on',lang))
        cy.answerRB('#lost_joblost-no-income')
        cy.answerRB('#unchanged_incomenone-of-the-above')
        cy.answerRB('#mortgage_paymentsno')
        cy.answerRB('#ccbno')
        cy.answerRB('#student_debtno')
        cy.answerRB('#plans_for_schoolno')
        cy.answerRB('#oassurvivor')
        cy.answerRB('#dtcyourself')
        cy.get('[data-cy=eligible-benefit-list]').children().should('have.length', '2')
        cy.get('#dtc_allowance')
      })
      it('dtc-oas', () => {
        cy.answerInput('#province-select',provinceLookup('on',lang))
        cy.answerRB('#lost_joblost-no-income')
        cy.answerRB('#unchanged_incomenone-of-the-above')
        cy.answerRB('#mortgage_paymentsno')
        cy.answerRB('#ccbno')
        cy.answerRB('#student_debtno')
        cy.answerRB('#plans_for_schoolno')
        cy.answerRB('#oasoas')
        cy.answerRB('#dtcyourself')
        cy.get('[data-cy=eligible-benefit-list]').children().should('have.length', '2')
        cy.get('#dtc_oas')
      })
    })
  })
})
