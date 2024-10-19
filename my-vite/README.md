

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



## vite 源码客户端代码简易梳理

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



#### 源码中热更新的主要逻辑

客户端，client.ts 中包含了 Vite 客户端热模块替换 (HMR) 的核心逻辑。以下是主要的热更新相关代码部分:

 

您好!我很高兴为您解析 Vite 源码中 client.ts 文件中与热更新相关的代码。这个文件包含了 Vite 客户端热模块替换 (HMR) 的核心逻辑。以下是主要的热更新相关代码部分:

1. WebSocket 连接设置:

```typescript:packages/vite/src/client/client.ts
// ... 前面的代码省略 ...

let socket: WebSocket
try {
  // ... 省略部分代码 ...
  socket = setupWebSocket(socketProtocol, socketHost, fallback)
} catch (error) {
  console.error(`[vite] failed to connect to websocket (${error}). `)
}

function setupWebSocket(
  protocol: string,
  hostAndPath: string,
  onCloseWithoutOpen?: () => void,
) {
  const socket = new WebSocket(`${protocol}://${hostAndPath}`, 'vite-hmr')
  // ... 省略部分代码 ...
}

// ... 后面的代码省略 ...
```

这部分代码设置了 WebSocket 连接，用于与 Vite 开发服务器进行实时通信。

2. HMR 客户端初始化:

```typescript:packages/vite/src/client/client.ts
const hmrClient = new HMRClient(
  {
    error: (err) => console.error('[vite]', err),
    debug: (...msg) => console.debug('[vite]', ...msg),
  },
  {
    isReady: () => socket && socket.readyState === 1,
    send: (payload) => socket.send(JSON.stringify(payload)),
  },
  async function importUpdatedModule({
    acceptedPath,
    timestamp,
    explicitImportRequired,
    isWithinCircularImport,
  }) {
    // ... 省略部分代码 ...
  },
)
```

这里创建了 HMR 客户端实例，用于处理热更新逻辑。

3. 消息处理函数:

```typescript:packages/vite/src/client/client.ts
async function handleMessage(payload: HotPayload) {
  switch (payload.type) {
    case 'connected':
      // ... 省略部分代码 ...
      break
    case 'update':
      // ... 处理更新逻辑 ...
      break
    case 'custom':
      // ... 处理自定义事件 ...
      break
    case 'full-reload':
      // ... 处理完全重载 ...
      break
    case 'prune':
      // ... 处理清理 ...
      break
    case 'error':
      // ... 处理错误 ...
      break
    // ... 省略其他情况 ...
  }
}
```

这个函数处理从服务器接收到的不同类型的热更新消息。

4. 样式更新函数:

```typescript:packages/vite/src/client/client.ts
export function updateStyle(id: string, content: string): void {
  // ... 更新或创建 style 标签的逻辑 ...
}

export function removeStyle(id: string): void {
  // ... 移除 style 标签的逻辑 ...
}
```

这些函数用于动态更新页面中的 CSS 样式。

5. 创建热更新上下文:

```typescript:packages/vite/src/client/client.ts
export function createHotContext(ownerPath: string): ViteHotContext {
  return new HMRContext(hmrClient, ownerPath)
}
```

这个函数为每个模块创建热更新上下文，允许模块定义自己的热更新行为。

这些是 client.ts 文件中与热更新直接相关的主要部分。整个文件协同工作，实现了 Vite 的客户端热模块替换功能，使得开发过程中的代码更改能够即时反映在浏览器中，无需完全刷新页面。





##### 开发环境下若更改了代码，如何做到浏览器显示最新内容

当代码发生更改时，Vite 通过以下步骤实现浏览器显示最新内容：

1. 服务器检测到文件变化并发送更新消息。
2. 客户端接收到更新消息并处理。
3. 根据更新类型（JS、CSS 等）执行相应的更新逻辑。

在 `client.ts` 文件中，主要相关代码如下：

```typescript:packages/vite/src/client/client.ts
async function handleMessage(payload: HotPayload) {
  switch (payload.type) {
    case 'update':
      notifyListeners('vite:beforeUpdate', payload)
      if (hasDocument) {
        // ... 省略部分代码 ...
      }
      await Promise.all(
        payload.updates.map(async (update): Promise<void> => {
          if (update.type === 'js-update') {
            return hmrClient.queueUpdate(update)
          }

          // css-update
          // 这部分处理 CSS 文件的更新
          const { path, timestamp } = update
          // ... 省略部分代码 ...
          const newPath = `${base}${searchUrl.slice(1)}${
            searchUrl.includes('?') ? '&' : '?'
          }t=${timestamp}`

          return new Promise((resolve) => {
            const newLinkTag = el.cloneNode() as HTMLLinkElement
            newLinkTag.href = new URL(newPath, el.href).href
            // ... 省略部分代码 ...
            el.after(newLinkTag)
          })
        }),
      )
      notifyListeners('vite:afterUpdate', payload)
      break
    // ... 省略其他 case ...
  }
}
```

这段代码处理从服务器接收到的更新消息。对于 JavaScript 更新，它调用 `hmrClient.queueUpdate(update)`；对于 CSS 更新，它创建新的 `<link>` 标签来加载更新后的样式。

对于 JavaScript 更新，`HMRClient` 类（在 `hmr.ts` 文件中定义）处理具体的更新逻辑：

对不起之前的回答有误，我现在重新梳理一下 Vite 客户端是如何处理 JavaScript 代码的热更新的。

在 `client.ts` 文件中，当收到服务器发来的更新消息时，会调用 `handleMessage` 函数：

```typescript:packages/vite/src/client/client.ts
async function handleMessage(payload: HotPayload) {
  switch (payload.type) {
    case 'update':
      // ... 省略部分代码 ...
      await Promise.all(
        payload.updates.map(async (update): Promise<void> => {
          if (update.type === 'js-update') {
            return hmrClient.queueUpdate(update)
          }
          // ... 处理其他类型的更新 ...
        }),
      )
      // ... 省略部分代码 ...
      break
    // ... 省略其他 case ...
  }
}
```

对于 JavaScript 更新，它调用 `hmrClient.queueUpdate(update)`。这个方法定义在 `HMRClient` 类中：

```typescript:packages/vite/src/shared/hmr.ts
export class HMRClient {
  // ... 省略其他代码 ...

  public async queueUpdate(payload: Update): Promise<void> {
    this.updateQueue.push(this.fetchUpdate(payload))
    if (!this.pendingUpdateQueue) {
      this.pendingUpdateQueue = true
      await Promise.resolve()
      this.pendingUpdateQueue = false
      const loading = [...this.updateQueue]
      this.updateQueue = []
      ;(await Promise.all(loading)).forEach((fn) => fn && fn())
    }
  }

  private async fetchUpdate(update: Update): Promise<(() => void) | undefined> {
    const { path, acceptedPath } = update
    const mod = this.hotModulesMap.get(path)
    if (!mod) {
      // 模块可能还未加载，跳过更新
      return
    }

    let fetchedModule: ModuleNamespace | undefined
    const isSelfUpdate = path === acceptedPath

    const qualifiedCallbacks = mod.callbacks.filter(({ deps }) =>
      deps.includes(acceptedPath),
    )

    if (isSelfUpdate || qualifiedCallbacks.length > 0) {
      const disposer = this.disposeMap.get(acceptedPath)
      if (disposer) await disposer(this.dataMap.get(acceptedPath))
      try {
        fetchedModule = await this.importUpdatedModule(update)
      } catch (e) {
        this.warnFailedUpdate(e, acceptedPath)
      }
    }

    return () => {
      for (const { deps, fn } of qualifiedCallbacks) {
        fn(
          deps.map((dep) => (dep === acceptedPath ? fetchedModule : undefined)),
        )
      }
      const loggedPath = isSelfUpdate ? path : `${acceptedPath} via ${path}`
      this.logger.debug(`hot updated: ${loggedPath}`)
    }
  }
}
```

处理 JavaScript 热更新的主要步骤如下：

1. `queueUpdate` 方法将更新任务添加到队列中。

2. `fetchUpdate` 方法负责获取更新后的模块：
   - 检查模块是否存在。
   - 确定需要执行的回调函数。
   - 如果需要，调用 `importUpdatedModule` 获取更新后的模块。

3. 更新完成后，执行相关的回调函数，应用更新。

4. 最后记录一条调试信息，表明模块已经被热更新。

这个过程确保了 JavaScript 更新能够按正确的顺序被应用，同时也处理了可能的错误情况。通过这种方式，Vite 能够在不刷新整个页面的情况下，将 JavaScript 的更改实时应用到运行中的应用程序。



这些方法负责获取更新后的模块并应用更新。

最后，更新后的模块会被重新执行，从而在浏览器中显示最新内容。对于 CSS 更新，新的样式表会被加载并应用，立即反映样式变化。

总的来说，这个过程是通过 WebSocket 通信、动态导入更新后的模块、替换旧模块或样式来实现的，使得浏览器能够无需完全刷新页面就能显示最新的代码更改。



对于 html 的处理如下：

对于 HTML 文件的处理，主要在 `handleMessage` 函数的 `'full-reload'` 分支中。这里是相关代码：

```typescript:packages/vite/src/client/client.ts
async function handleMessage(payload: HotPayload) {
  switch (payload.type) {
    // ... 其他 case 省略 ...
    case 'full-reload':
      notifyListeners('vite:beforeFullReload', payload)
      if (hasDocument) {
        if (payload.path && payload.path.endsWith('.html')) {
          // 如果编辑的是 html 文件，只在浏览器当前在该页面时重新加载
          const pagePath = decodeURI(location.pathname)
          const payloadPath = base + payload.path.slice(1)
          if (
            pagePath === payloadPath ||
            payload.path === '/index.html' ||
            (pagePath.endsWith('/') && pagePath + 'index.html' === payloadPath)
          ) {
            pageReload()
          }
          return
        } else {
          pageReload()
        }
      }
      break
    // ... 其他 case 省略 ...
  }
}

// pageReload 函数定义
const pageReload = debounceReload(50)

const debounceReload = (time: number) => {
  let timer: ReturnType<typeof setTimeout> | null
  return () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    timer = setTimeout(() => {
      location.reload()
    }, time)
  }
}
```

这段代码的工作原理如下：

1. 当收到 `'full-reload'` 类型的消息时，会检查是否是 HTML 文件的更改。

2. 如果是 HTML 文件更改：
   - 比较当前页面路径与更改的 HTML 文件路径。
   - 如果匹配（包括 index.html 的特殊处理），则调用 `pageReload()`。

3. 如果不是 HTML 文件更改，直接调用 `pageReload()`。

4. `pageReload` 函数使用了防抖处理，延迟 50 毫秒后才实际执行 `location.reload()`，这是为了避免短时间内多次重载。

对于 HTML 文件的更改，Vite 采用的是完全重新加载页面的策略，而不是像 JS 或 CSS 那样进行局部更新。这是因为 HTML 通常定义了页面的整体结构，很难进行局部热更新。

总的来说，HTML 文件的更改会触发整个页面的重新加载，但只有当浏览器当前正在查看该 HTML 页面时才会执行重载，这样可以避免不必要的页面刷新。





