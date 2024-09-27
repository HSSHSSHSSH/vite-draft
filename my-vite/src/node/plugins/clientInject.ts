import { CLIENT_PUBLIC_PATH, HMR_PORT } from '../constants'
import { Plugin } from '../plugin'
import fs from 'fs-extra'
import path from 'path'
import { ServerContext } from '../server'

// 创建一个客户端注入插件
export function clientInjectPlugin(): Plugin {
  let serverContext: ServerContext
  return {
    name: 'm-vite:client-inject',
    // 配置服务器,保存服务器上下文
    configureServer(_s) {
      serverContext = _s
    },
    // 解析模块ID
    resolveId(id) {
      if (id === CLIENT_PUBLIC_PATH) {
        return { id }
      }
      return null
    },
    // 加载模块内容
    async load(id) {
      // 加载 HMR 客户端脚本
      if (id === CLIENT_PUBLIC_PATH) {
        // 获取客户端脚本的真实路径
        const realPath = path.join(
          serverContext.root,
          'node_modules',
          'my-vite',
          'dist',
          'client.mjs',
        )
        // 读取脚本内容
        const code = await fs.readFile(realPath, 'utf-8')
        // 替换 HMR 端口占位符
        return {
          code: code.replace('__HMR_PORT__', JSON.stringify(HMR_PORT)),
        }
      }
    },
    // 转换 HTML 内容
    transformIndexHtml(raw) {
      // 在 <head> 标签后插入客户端脚本
      return raw.replace(
        /(<head[^>]*>)/i,
        `$1<script type="module" src="${CLIENT_PUBLIC_PATH}"></script>`,
      )
    },
  }
}
