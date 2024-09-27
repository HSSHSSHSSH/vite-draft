// 导入 connect 库，用于创建 HTTP 服务器
import connect from 'connect'

// 导入 picocolors 库中的 blue 和 green 函数，用于控制台输出彩色文字
import { blue, green } from 'picocolors'

// 导入优化相关函数
import { optimize } from '../optimizer'
// 导入插件解析函数
import { resolvePlugins } from '../plugins'
// 导入插件容器相关函数和接口
import { createPluginContainer, PluginContainer } from '../pluginContainer'
// 导入插件接口
import { Plugin } from '../plugin'
// 导入 IndexHtml 中间件
import { IndexHtmlMiddleware } from './middlewares/indexHtml'
// 导入转换中间件
import { transformMiddleware } from './middlewares/transform'
// 导入静态文件中间件
import { staticMiddleware } from './middlewares/static'
// 导入模块图类
import { ModuleGraph } from '../moduleGraph'
// 导入 chokidar 库及其 FSWatcher 类型，用于文件监听
import chokidar, { FSWatcher } from 'chokidar'
// 导入 WebSocket 服务器创建函数
import { createWebSocketServer } from '../ws'
// 导入 HMR 事件绑定函数
import {bindingHMREvents} from '../hmr'
// 导入路径规范化函数
import {normalizePath} from '../utils'

// 定义服务器上下文接口
export interface ServerContext {
  root: string
  pluginContainer: PluginContainer
  app: connect.Server
  plugins: Plugin[]
  moduleGraph: ModuleGraph,
  ws: {
    send: (data: any) => void
    close: () => void
  },
  watcher: FSWatcher
}

// 启动开发服务器的主函数
export async function startDevServer() {
  // 创建 connect 应用
  const app = connect()
  // 创建 WebSocket 服务器
  const ws = createWebSocketServer(app)
  // 获取当前工作目录
  const root = process.cwd()
  console.log(blue(`Serving ${root}`))
  const startTime = Date.now()
  // 解析插件
  const plugins = resolvePlugins()
  // 创建插件容器
  const pluginContainer = createPluginContainer(plugins)
  // 创建模块图
  const moduleGraph = new ModuleGraph((url) => pluginContainer.resolveId(url))
  // 创建文件监听器
  const watcher = chokidar.watch(root, {
    ignored: ["**/node_modules/**", "**/.git/**"],
    ignoreInitial: true,
  })  
  // 创建服务器上下文
  const serverContext: ServerContext = {
    root: normalizePath(process.cwd()),
    app,
    pluginContainer,
    plugins,
    moduleGraph,
    ws,
    watcher
  }

  // 绑定 HMR 事件  当文件发生变化时，触发 HMR，通过 websocket 通知客户端
  bindingHMREvents(serverContext)

  // 调用插件的 configureServer 钩子
  for (const plugin of plugins) {
    if (plugin.configureServer) {
      await plugin.configureServer(serverContext)
    }
  }
  
  // 添加中间件
  // 核心编译中间件
  app.use(transformMiddleware(serverContext))
  // 入口 HTML 编译中间件
  app.use(IndexHtmlMiddleware(serverContext))
  // 静态文件处理中间件
  app.use(staticMiddleware(serverContext.root))
  
  // 启动服务器
  app.listen(3000, async () => {
    // 执行预构建
    await optimize(root)
    console.log(green(`Server started in ${Date.now() - startTime}ms`))
    console.log(blue(`Server running at http://localhost:3000`))
  })
}
