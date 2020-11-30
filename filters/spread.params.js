const spreadParams = (env) => {
  env.addFilter('spreadParams', (str, params) => {
    let paramsStr = ''

    for (const property in params) {
      paramsStr += ` ${property}=${params[property]} `
    }

    return `${paramsStr}`
  })
}

module.exports = {
  spreadParams,
}
