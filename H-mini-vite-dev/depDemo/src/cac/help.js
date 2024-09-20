// display help information and version

const cac = require('cac')

const cli = cac()

cli.option('--type <type>', 'Choose a project type', {
  default: 'node'
})

cli.option('--name <name>', 'Provide your name')

cli.command('lint [...files]', 'lint files').action((file, options) => {
  console.log('first command', file, options)
})

// display help message when '-h' or '--help' appears
cli.help()

// display version number when '-v' or '--version' appears
cli.version('0.0.123456')

cli.parse()