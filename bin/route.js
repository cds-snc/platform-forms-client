#!/usr/bin/env node

// usage: node ./bin/route.js create --route your_route_name

const copy = require('copy-template-dir')
const path = require('path')
const commander = require('commander')
const program = new commander.Command()
program.version('0.0.1')
program.option('create', 'Creates a new route')
program.option('--route <type>', 'name of new route')

program.parse(process.argv)

if (program.create) {
  if (!program.route) {
    console.log('--route missing new route name')
    return
  }

  const name = program.route
  const vars = { sample: program.route }
  const inDir = path.join(path.join(__dirname, './'), '/route/[[sample]]')
  const outDir = path.join(process.cwd(), `/routes/${name}`)

  copy(inDir, outDir, vars, (err, createdFiles) => {
    if (err) throw err
    createdFiles.forEach(filePath => console.log(`Created ${filePath}`))
    console.log(
      `\nDone => Ensure you add "${name}" to config/routes.config.js\n`,
    )
  })
}
