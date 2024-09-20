const cac = require('cac')

const cli = cac()


// <> 中的内容是必填项，[] 中的内容是可选项

cli
  .command('deploy <dir>, "Deploy a folder to AWS')
  .option('--scale [level]', 'Scaling level')
  .action((folder, options) => {
    console.log('deploy','folder', folder, 'options', options)
  })

cli
  .command('build [project], "Build a project')
  .option('--out <dir>', 'Output directory')
  .action((folder, options) => {
    console.log('build','folder', folder, 'options', options)
  })

  cli.help()
  cli.parse()
