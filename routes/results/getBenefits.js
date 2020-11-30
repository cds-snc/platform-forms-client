const glob = require('glob')
const path = require('path')

/*
This method checks to see if an input object matches a pattern
This pattern can have scalar values, or arrays as the item being matched
If it's a scalar we need an exact match, if it's an array we only care if the value
matches one of the items in the output.
*/
function match(input, pattern, result) {
  const keys = Object.keys(pattern)

  const value = keys.reduce((previousIterationResult, key) => {
    const patternValueToMatch = pattern[key]
    const actualValue = input[key]

    // If the value is an array we only care if we match one item
    if (typeof patternValueToMatch === typeof []) {
      /* algorithm is as follows:
        Logical OR the result of the current match against the previous
        Since all we care is if the value we are matching is equal to
        one item in the patternValueToMatch array we are iterating through
      */
      return patternValueToMatch.reduce((p, c) => p || c === actualValue, false)
    }

    const matchResult = patternValueToMatch === actualValue
    return previousIterationResult && matchResult
  }, true)

  if (value === true) {
    return result
  }

  return undefined
}

const getBenefits = (data, featureFlags) => {
  var results = []

  results.push(
    match(
      data,
      {
        lost_job: 'lost-all-income',
        no_income: 'lost-job-employer-closed',
      },
      'cerb',
    ),
  )
  results.push(
    match(
      data,
      {
        lost_job: 'lost-some-income',
        some_income: ['hours-reduced', 'employed-lost-a-job'],
        reduced_income: '1000_or_less',
      },
      'cerb',
    ),
  )

  results.push(
    match(
      data,
      {
        lost_job: 'lost-all-income',
        no_income: 'sick-or-quarantined',
      },
      'cerb',
    ),
  )

  results.push(
    match(
      data,
      {
        lost_job: 'lost-some-income',
        some_income: 'quarantine',
      },
      'cerb',
    ),
  )

  results.push(
    match(
      data,
      {
        lost_job: 'lost-all-income',
        no_income: [
          'self-employed-closed',
          'unpaid-leave-to-care',
          'parental-recently-cant-return',
          'ei-recently-claim-ended',
        ],
      },
      'cerb',
    ),
  )

  results.push(
    match(
      data,
      {
        lost_job: 'lost-some-income',
        some_income: 'selfemployed-some-income',
        reduced_income: '1000_or_less',
      },
      'cerb',
    ),
  )

  results.push(
    match(
      data,
      {
        lost_job: 'lost-all-income',
        no_income: 'student_2019_20',
      },
      'cesb',
    ),
  )

  results.push(
    match(
      data,
      {
        lost_job: 'lost-no-income',
        unchanged_income: ['student_2019_20', 'high_school_grad'],
      },
      'cesb',
    ),
  )

  results.push(match(data, { gross_income: 'over_5k' }, 'cerb'))

  results.push(
    match(
      data,
      {
        some_income: 'hours-reduced',
        reduced_income: '1001_or_more',
      },
      'ei_workshare',
    ),
  )

  results.push(
    match(data, { mortgage_payments: 'yes-mortgage' }, 'mortgage_deferral'),
  )

  results.push(match(data, { mortgage_payments: 'yes-rent' }, 'rent_help'))
  results.push(match(data, { student_debt: 'yes' }, 'student_loan'))
  results.push(match(data, { ccb: ['yes', 'unsure'] }, 'ccb_payment'))

  results.push(match(data, { oas: ['oas', 'allowance', 'survivor'] }, 'oas'))

  if (featureFlags.enableDtc){

    // DTC Benefits
    results.push(match(data, { oas: 'oas', dtc: 'yourself' }, 'dtc_oas'))
    results.push(match(data, { oas: 'no', dtc: 'yourself' }, 'dtc'))
    results.push(
      match(
        data,
        { oas: ['allowance', 'survivor'], dtc: 'yourself' },
        'dtc_allowance',
      ),
    )
    results.push(match(data, { dtc: 'child' }, 'dtc_child'))

  }

  results.push(match(data, { rrif: 'yes' }, 'rrif'))

  results.push(
    match(
      data,
      {
        plans_for_school: 'yes',
      },
      'student_financial_aid',
    ),
  )

  return results.filter((v) => v !== undefined)
}

const getProvincialBenefits = (data) => {
  return data.province ? 'province-' + data.province : false
}

const getAllBenefits = (featureFlags) => {
  const benefitList = []

  let ignore
  if (featureFlags.enableDtc) {
    ignore = ['province-*', 'dtc_*.njk']
  } else {
    ignore = ['province-*', 'dtc*.njk']
  }

  // Get a list of all the benefit cards
  // Ignore provincial benefits and the dtc variants
  const files = glob.sync('**/*.njk', {
    cwd: path.join(__dirname, '../../views/benefits'),
    ignore,
  })

  // Grab the benefit name portion of the filename
  files.forEach((file) => {
    const fileParts = file.split('-')
    benefitList.push(fileParts[0])
  })

  // We just the unique items in the list
  const benefitsFullList = benefitList.filter(function (item, pos) {
    return benefitList.indexOf(item) === pos
  })

  return benefitsFullList
}

module.exports = {
  getBenefits,
  getProvincialBenefits,
  getAllBenefits,
}
