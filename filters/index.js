const { spreadParams } = require('./spread.params')
const { lastUpdated } = require('./last.updated')
const { localizedSort } = require('./localized.sort')

const addNunjucksFilters = (env) => {
  spreadParams(env)
  lastUpdated(env)
  localizedSort(env)
}

module.exports = {
  addNunjucksFilters,
}
