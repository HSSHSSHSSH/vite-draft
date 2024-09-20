const {build} = require('esbuild')
const {myPlugin} = require('./plugin')
const path = require('path')

const entryPath = path.resolve(__dirname, './demo.js')

console.log('entryPath', entryPath)

build({
  entryPoints: [entryPath],
  bundle: true,
  outfile: path.resolve(__dirname, './dist/index.js'),
  plugins: [myPlugin()],
})