const cac = require('cac')

const {startServer} = require('./server')
const cli = cac()

cli
  .command('launch', 'Launch my-vite')
  .action(async () => {
    await startServer()
  })  


  cli.help()
  cli.parse()