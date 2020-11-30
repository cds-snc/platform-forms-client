const  getBenefits  = (data) => require('./getBenefits').getBenefits(data, {enableDtc: true})
const { getProvincialBenefits } = require('./getBenefits')

describe('Test the getBenefits calculator', () => {

  test('It checks ei regular + cerb path', () => {
    const result = getBenefits({
      lost_job: 'lost-all-income',
      no_income: 'lost-job-employer-closed',
    })

    expect(result).toContain('cerb')
  })

  test('It checks ei regular + cerb some-income path', () => {
    const incomes = ['hours-reduced', 'employed-lost-a-job']

    incomes.forEach(income => {
      const result = getBenefits({
        lost_job: 'lost-some-income',
        some_income: income,
        reduced_income: '1000_or_less',
      })

      expect(result).toContain('cerb')
    })

  })


  test('It checks ei sickness + cerb path', () => {
    const result = getBenefits({
      lost_job: 'lost-all-income',
      no_income: 'sick-or-quarantined',
    })

    expect(result).toContain('cerb')
  })

  test('It checks cerb-only path 1', () => {
    const options = [
      'self-employed-closed',
      'unpaid-leave-to-care',
      'parental-recently-cant-return',
      'ei-recently-claim-ended',
    ]

    options.forEach(income => {
      const result = getBenefits({
        lost_job: 'lost-all-income',
        no_income: income,
      })

      expect(result).toContain('cerb')
    })
  })

  test('It checks cerb for some-income answers', () => {

    const result = getBenefits({
      lost_job: 'lost-some-income',
      some_income: 'selfemployed-some-income',
      reduced_income: '1000_or_less',
    })

    expect(result).toContain('cerb')

  })

  test('Quarantine Lost some ', () => {
    const result = getBenefits({
      lost_job: 'lost-some-income',
      some_income: 'quarantine',
    })

    expect(result).toContain('cerb')
  })

  test('It checks cerb-only path 3', () => {

    const result = getBenefits({
      gross_income: 'over_5k',
    })

    expect(result).toContain('cerb')
  })

  test('It checks the ei-workshare add-on', () => {

    const result = getBenefits({
      lost_job: 'lost-some-income',
      some_income: 'hours-reduced',
      reduced_income: '1001_or_more',
    })

    expect(result).toContain('ei_workshare')
  })


  test('It checks the mortgage addon', () => {
    const result = getBenefits({
      mortgage_payments: 'yes-mortgage',
    })

    expect(result).toContain('mortgage_deferral')
  })

  test('It checks the rent addon', () => {
    const result = getBenefits({
      mortgage_payments: 'yes-rent',
    })

    expect(result).toContain('rent_help')
  })

  test('It checks the ccb addon', () => {
    const options = ['yes', 'unsure']

    options.forEach(ccb => {
      const result = getBenefits({
        ccb: ccb,
      })

      expect(result).toContain('ccb_payment')
    })
  })

  test('It checks the rrif addon', () => {
    const expected = ['rrif']

    const result = getBenefits({
      rrif: 'yes',
    })

    expect(result).toEqual(expect.arrayContaining(expected))
  })

  test('It checks the student debt addon', () => {
    const result = getBenefits({
      student_debt: 'yes',
    })

    expect(result).toContain('student_loan')
  })

  test('It checks the oas addon', () => {
    const options = ['oas', 'allowance', 'survivor']

    options.forEach(oas => {
      const result = getBenefits({
        oas: oas,
      })

      expect(result).toContain('oas')
    })
  })

  test('It checks for cesb no-income student_2019_20', () => {
    const result = getBenefits({
      lost_job: 'lost-all-income',
      no_income: 'student_2019_20',
    })

    expect(result).toContain('cesb')
  })

  test('It checks for cesb unchanged-income high_school_grad', () => {
    const result = getBenefits({
      lost_job: 'lost-no-income',
      unchanged_income: 'high_school_grad',
    })

    expect(result).toContain('cesb')
  })

  test('It checks for cesb unchanged-income', () => {
    const result = getBenefits({
      lost_job: 'lost-no-income',
      unchanged_income: 'student_2019_20',
    })

    expect(result).toContain('cesb')
  })

  test('It checks for student financial aid', () => {
    const result = getBenefits({
      plans_for_school: 'yes',
    })

    expect(result).toContain('student_financial_aid')
  })

  test('It should only pass if it matches everything in the pattern', () => {
    const result = getBenefits({
      lost_job: 'lost-some-income',
    })

    expect(result).toHaveLength(0)
  })

  test('It checks provincial benefits', () => {
    const provinces = ['ab', 'bc', 'mb', 'nb', 'nl', 'ns', 'nt', 'nu', 'on', 'pe', 'qc', 'sk', 'yt']

    provinces.forEach((province) => {
      const result = getProvincialBenefits({
        province: province,
      })

      expect(result).toContain('province-' + province)
    })
  })
})