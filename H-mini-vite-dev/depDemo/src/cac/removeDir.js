const cac = require('cac')

const cli = cac()

cli
  .command('rm <dir>, "Remove a dir')
  .option('-r, --recursive', 'Remove recursively')
  .option('-w, --wajiaoni', "蛙叫你")
  .action((dir, options) => {
    console.log('remove ' + dir + (options.recursive ? ' recursively' : '') + (options.wajiaoni ? ' 蛙叫你' : ''))
  })

cli.help()

cli.parse()