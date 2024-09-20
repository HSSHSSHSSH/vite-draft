module.exports = {
  myPlugin() {
    return {
      name: 'my-plugin',
      setup(build) {
        build.onLoad(
         { filter: /.*/},
         (loadInfo) => {
          let proxyModule = []
            console.log('onLoad', loadInfo)
            const res = require(loadInfo.path)
            console.log('res',res)
            const specifiers = Object.keys(res)
            proxyModule.push(
              `export { ${specifiers.join(",")} } from "${relativePath}"`,
              `export default require("${relativePath}")`
            )
            return {
              loader: 'js',
              contents: proxyModule.join("\n"),
            }
         }
        )
      }
    }
  },
}
