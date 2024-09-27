

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