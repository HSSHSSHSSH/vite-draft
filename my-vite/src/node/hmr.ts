import { ServerContext } from './server'
import { ModuleNode } from './moduleGraph'
import { normalizePath } from './utils'

// 当文件发生变化时，触发 HMR，通过 websocket 通知客户端
export function bindingHMREvents(serverContext: ServerContext) {
  const { watcher, ws, root } = serverContext

  watcher.on('change', async (file) => {
    const normalizedFile = normalizePath(file)
    const moduleNode = serverContext.moduleGraph.getModuleById(normalizedFile)
    if (moduleNode) {
      // 发送更新消息
      ws.send({
        type: 'update',
        updates: [
          {
            type: moduleNode.type === 'js' ? 'js-update' : 'css-update',
            path: normalizedFile,
            acceptedPath: normalizedFile,
            timestamp: Date.now()
          }
        ]
      })
    }
  })
}