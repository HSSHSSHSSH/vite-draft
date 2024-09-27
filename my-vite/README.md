

## 运行机制

当您在根目录中执行 `npm run dev` 后，简易版 Vite 的运行机制如下：

1. 服务端运行：

当执行 `npm run dev` 时，实际上是运行了 `package.json` 中定义的 `start` 脚本：

```json
"scripts": {
  "start": "tsup --watch",
  // ...
}
```

这个命令会使用 `tsup` 来编译和监视项目文件的变化。编译后的入口文件是 `dist/index.js`。

然后，通过 `bin` 字段定义的 `my-vite` 命令会执行 `bin/my-vite.js`：

```javascript
#!/usr/bin/env node
require("../dist/index.js");
```

这个脚本会加载编译后的 `index.js`，其中包含了 `cli.ts` 的内容。

`cli.ts` 中定义了命令行接口，当执行 `my-vite` 命令时，会调用 `startDevServer()` 函数来启动开发服务器。

服务端主要负责：

- 启动 HTTP 服务器
- 启动 WebSocket 服务器
- 处理文件的编译和转换
- 监听文件变化并发送更新通知

2. 客户端运行：

客户端代码（`client.ts`）不会直接运行，而是被注入到浏览器中。这个过程通常发生在以下情况：

- 当服务器处理 HTML 文件时，会在 `<head>` 标签中注入一个指向客户端脚本的 `<script>` 标签。
- 当浏览器加载这个 HTML 文件时，会请求并执行这个客户端脚本。

客户端脚本主要负责：

- 建立与服务器的 WebSocket 连接
- 接收服务器发送的更新通知
- 处理热更新逻辑，如重新加载模块或更新样式

运行流程：

1. 执行 `npm run dev`
2. `tsup` 编译项目文件
3. 执行 `bin/my-vite.js`，加载编译后的 `index.js`
4. 调用 `startDevServer()` 启动开发服务器
5. 服务器开始监听 HTTP 请求和文件变化
6. 当浏览器请求页面时，服务器注入客户端脚本
7. 浏览器加载并执行客户端脚本，建立 WebSocket 连接
8. 当文件发生变化时，服务器通过 WebSocket 发送更新通知
9. 客户端接收通知并执行热更新逻辑

总结：服务端在开发服务器启动时就开始运行，而客户端代码是在浏览器加载页面时被注入和执行的。两者通过 WebSocket 保持实时通信，实现了热模块替换（HMR）的功能。



## 客户端代码简易梳理

好的，我来为您详细解释客户端的代码逻辑。

```typescript:src/client/client.ts
console.log('[vite] connecting....')

// 创建客户端 websocket 实例
const socket = new WebSocket('ws://localhost:__HMR_PORT__')

socket.addEventListener('message', async ({ data }) => {
  handleMessage(JSON.parse(data)).catch(console.error)
})

async function handleMessage(payload: any) {
  console.log('[vite] message received: ', payload)
  switch (payload.type) {
    case 'connected':
      console.log('[vite] connected')
      setInterval(() => {
        socket.send(JSON.stringify({ type: 'ping' }))
      }, 1000)
      break
    case 'update':
      payload.updates.forEach((update: Update) => {
        if (update.type === 'js-update') {
           fetchUpdate(update)
        }
      })
      break
    default:
      break
  }
}
```

1. WebSocket 连接：
   - 客户端创建一个 WebSocket 连接，连接到 `ws://localhost:__HMR_PORT__`。
   - `__HMR_PORT__` 是一个占位符，实际运行时会被替换为真实的端口号。

2. 消息处理：
   - 使用 `addEventListener` 监听 'message' 事件。
   - 当收到消息时，将消息数据解析为 JSON，然后传递给 `handleMessage` 函数处理。

3. `handleMessage` 函数：
   - 根据消息类型（`payload.type`）执行不同的操作：
     - 'connected'：表示连接成功，开始每秒发送一次 'ping' 消息以保持连接活跃。
     - 'update'：处理更新消息，遍历 `payload.updates`，对 'js-update' 类型的更新调用 `fetchUpdate` 函数。

```typescript
interface HotModule {
  id: string
  callbacks: HotCallback[]
}

interface HotCallback {
  deps: string[]
  fn: (modules: object[]) => void
}

// HMR 模块表
const hotModulesMap = new Map<string, HotModule>()
// 不再生效的模块表
const pruneMap = new Map<string, (data: any) => void | Promise<void>>()

export const createHotContext = (ownerPath: string) => {
  // ... (代码略)
}
```

4. HMR 相关数据结构：
   - `HotModule` 和 `HotCallback` 接口定义了热更新模块的结构。
   - `hotModulesMap` 存储需要热更新的模块信息。
   - `pruneMap` 存储模块不再生效时的回调函数。

5. `createHotContext` 函数：
   - 为每个模块创建一个热更新上下文。
   - 提供 `accept` 方法用于接受模块自身的更新。
   - 提供 `prune` 方法用于设置模块不再生效时的回调。

```typescript
async function fetchUpdate({ path, timestamp }: Update) {
  // ... (代码略)
}
```

6. `fetchUpdate` 函数：
   - 用于获取并应用模块更新。
   - 通过动态 import 加载最新的模块版本。
   - 执行更新回调，应用热更新。

```typescript
// 用于 css 的 HMR
const sheetsMap = new Map()

export function updateStyle(id: string, content: string) {
  // ... (代码略)
}

export function removeStyle(id: string): void {
  // ... (代码略)
}
```

7. CSS 热更新：
   - `updateStyle` 函数用于添加或更新 style 标签的内容。
   - `removeStyle` 函数用于移除不再需要的 style 标签。

总结：
这个客户端代码实现了一个简单的热模块替换（HMR）系统。它通过 WebSocket 与服务器保持连接，接收更新通知，并能够动态地更新 JavaScript 模块和 CSS 样式。这种机制允许在不刷新整个页面的情况下，实时更新应用程序的部分内容，从而提高开发效率。