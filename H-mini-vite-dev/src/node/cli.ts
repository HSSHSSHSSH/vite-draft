import cac from 'cac'
import {startServer} from './server'

const cli = cac()

cli
  .command('[launch]', "start a server")
  .action(async () => {
    await startServer()
  })

cli.help()

cli.parse()