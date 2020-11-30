const localizedSort = (env) => {
  env.addFilter('localizedSort', (values, attribute, locale) => {
    return values.sort((a,b) => a[attribute].localeCompare(b[attribute],locale))
  })
}

module.exports = {
  localizedSort,
}
