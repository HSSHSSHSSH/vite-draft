const cac = require('cac')

const cli = cac()

cli
  .command("[root]", "Run the development server")
  .alias("server")
  .alias("dev")
  .action((root, options) => {
    console.log('root', root, options)
  })

cli.help()

cli.parse()