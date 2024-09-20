// 返回部分配置（推荐）
export const editConfigPlugin = () => ({
  name: 'vite-plugin-modify-config',
  config: (config, { command }) => {
    console.log('config hook triggered')
  },
  configResolved: (config) => {
    console.log('configResolved hook triggered')
  },
  configureServer() {
    console.log('configureServer hook triggered')
  },
  transformIndexHtml() {
    console.log('transformIndexHtml hook triggered')
  },
  handleHotUpdate() {
    console.log('handleHotUpdate hook triggered')
  }
})
