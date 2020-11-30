/* istanbul ignore file */
// note: there's test to look for a false response
// but coverage isn't catching 

const path = require('path')
const { clientJsDir, getClientJsPath } = require('./url.helpers')

const getClientJs = (req, routeName = '', jsPath = '../public') => {
  const fs = require('fs')

  try {
    const fileList = path.join(
      __dirname,
      `${jsPath}${clientJsDir}_filelist.json`,
    )
    const content = fs.readFileSync(fileList)

    const json = JSON.parse(content)
    // get the JS filename from the list
    // _filelist.json
    /*
    {
      "start":"start.9dfca2e687c206cf5967.js",
      ...
    }
    */
    const file = json[routeName]
    const filePath = path.join(__dirname, `${jsPath}${clientJsDir}${file}`)
    const fileExists = fs.readFileSync(filePath)

    if (fileExists) {
      return `${getClientJsPath(req)}${file}`
    }

    return false
  } catch (e) {
    // console.log(e.message)
    console.log(`${routeName}.js or filelist.json doesn't exist`)
    return false
  }
}

module.exports = {
  getClientJs,
}
