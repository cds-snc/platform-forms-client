const fse = require('fs-extra')
const rimraf = require('rimraf')
const path = require('path')
const filePath = path.resolve(__dirname, 'local-image')

const copyFiles = async file => {
  try {
    const src = path.resolve(__dirname, `../${file}`)
    await fse.copy(src, `${filePath}/${file}`)
    console.log(`copied "${file}"`)
  } catch (err) {
    console.error(err)
  }
}

const files = [
  'assets',
  'bin',
  'config',
  'locales',
  'patches',
  'public',
  'routes',
  'utils',
  'views',
  'package.json',
  'Dockerfile',
  'app.js'
]

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

const copyApp = async cb => {
  rimraf(filePath, async () => {
    await asyncForEach(files, async src => {
      await copyFiles(src)
    })
    cb()
  })
}

module.exports = {
  copyApp,
}
