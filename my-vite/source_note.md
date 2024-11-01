## 服务器的创建 

### 正常模式 (middlewareMode 为 false)

```node/server/index.ts/_createServer
const middlewares = connect() as Connect.Server  // 第三方库 connect 的实例
  console.log('middlewares', middlewares)
  const httpServer = middlewareMode
    ? null
    : await resolveHttpServer(serverConfig, middlewares, httpsOptions)
```

```src/node/http.ts/resolveHttpServer
if (!httpsOptions) {
    const { createServer } = await import('node:http')
    return createServer(app)
  }
```



connect 作为 app 实例，使用 http 模块中的 createServer 创建服务器，

#### connect 实例

在 connect 中

##### 1. 基础设置和依赖

```javascript
// 核心依赖
var debug = require('debug')('connect:dispatcher');
var EventEmitter = require('events').EventEmitter;
var finalhandler = require('finalhandler');
var http = require('http');
var merge = require('utils-merge');
var parseUrl = require('parseurl');
```

这些依赖各自的作用：
- `debug`: 用于调试输出
- `EventEmitter`: 事件发射器，用于实现事件机制
- `finalhandler`: 请求处理的最终处理器
- `parseUrl`: URL 解析工具

##### 2. 核心功能实现

###### 2.1 服务器创建
```javascript
function createServer() {
  function app(req, res, next){ app.handle(req, res, next); }
  merge(app, proto);
  merge(app, EventEmitter.prototype);
  app.route = '/';
  app.stack = [];
  return app;
}
```
特点：
- 返回一个函数而不是对象
- 继承 EventEmitter 的特性
- 维护一个中间件栈 `stack`

###### 2.2 中间件注册机制
```javascript
proto.use = function use(route, fn) {
  var handle = fn;
  var path = route;

  // 路由默认值处理
  if (typeof route !== 'string') {
    handle = route;
    path = '/';
  }

  // 处理子应用
  if (typeof handle.handle === 'function') {
    var server = handle;
    server.route = path;
    handle = function (req, res, next) {
      server.handle(req, res, next);
    };
  }

  // 处理原生 http 服务器
  if (handle instanceof http.Server) {
    handle = handle.listeners('request')[0];
  }

  this.stack.push({ route: path, handle: handle });
  return this;
};
```

支持的中间件类型：
1. 普通函数中间件
2. 子应用（具有 handle 方法）
3. HTTP 服务器实例

###### 2.3 请求处理流程
```javascript
proto.handle = function handle(req, res, out) {
  var index = 0;
  var stack = this.stack;
  
  // 最终处理器
  var done = out || finalhandler(req, res, {
    env: env,
    onerror: logerror
  });

  function next(err) {
    var layer = stack[index++];
    
    // 所有中间件处理完毕
    if (!layer) {
      defer(done, err);
      return;
    }

    // 路由匹配逻辑
    var path = parseUrl(req).pathname || '/';
    var route = layer.route;
    
    // 调用中间件
    call(layer.handle, route, err, req, res, next);
  }

  next();
};
```

关键处理步骤：
1. 维护中间件索引
2. 路由匹配检查
3. 错误处理机制
4. 异步流程控制

###### 2.4 中间件调用机制
```javascript
function call(handle, route, err, req, res, next) {
  var arity = handle.length;
  var hasError = Boolean(err);

  try {
    if (hasError && arity === 4) {
      // 错误处理中间件
      handle(err, req, res, next);
    } else if (!hasError && arity < 4) {
      // 普通请求处理中间件
      handle(req, res, next);
    }
  } catch (e) {
    next(e);
  }
}
```

中间件分类：
- 错误处理中间件：4个参数 (err, req, res, next)
- 普通中间件：3个参数 (req, res, next)

##### 3. 高级特性

###### 3.1 路由处理
- 支持子路径挂载
- 自动处理尾部斜杠
- 保持原始 URL（originalUrl）

###### 3.2 错误处理
```javascript
function logerror(err) {
  if (env !== 'test') console.error(err.stack || err.toString());
}
```
- 开发环境下输出完整错误栈
- 测试环境禁止错误输出

###### 3.3 协议支持
```javascript
function getProtohost(url) {
  if (url.length === 0 || url[0] === '/') {
    return undefined;
  }

  var fqdnIndex = url.indexOf('://')
  return fqdnIndex !== -1 && url.lastIndexOf('?', fqdnIndex) === -1
    ? url.substr(0, url.indexOf('/', 3 + fqdnIndex))
    : undefined;
}
```
- 支持完整 URL 处理
- 协议和主机名提取

##### 4. 使用示例

```javascript
var connect = require('connect');
var http = require('http');

var app = connect();

// 添加中间件
app.use(logger());
app.use('/api', apiRouter);
app.use(errorHandler);

// 启动服务器
http.createServer(app).listen(3000);
```

这个框架的设计非常优雅，为后来的 Express.js 等框架奠定了基础，它的中间件模式也成为了 Node.js 生态系统中的一个重要模式。

#### 中间件的注册

当浏览器访问 Vite 开发服务器时，请求会按顺序经过以下中间件处理链：

1. **调试计时中间件** (可选)
```typescript
if (process.env.DEBUG) {
  middlewares.use(timeMiddleware(root))
}
```
- 记录请求处理时间，仅在调试模式下启用

2. **CORS 中间件**
```typescript
if (cors !== false) {
  middlewares.use(corsMiddleware(typeof cors === 'boolean' ? {} : cors))
}
```
- 处理跨域请求
- 必须最先处理以确保正确设置响应头

3. **缓存转换中间件**
```typescript
middlewares.use(cachedTransformMiddleware(server))
```
- 检查请求的资源是否有缓存的转换结果
- 提高性能，避免重复转换

4. **代理中间件** (可选)
```typescript
if (proxy) {
  middlewares.use(proxyMiddleware(middlewareServer, proxy, config))
}
```
- 处理开发时的 API 代理需求
- 将特定请求转发到其他服务器

5. **Base 路径中间件** (可选)
```typescript
if (config.base !== '/') {
  middlewares.use(baseMiddleware(config.rawBase, !!middlewareMode))
}
```
- 处理非根路径部署的情况

6. **源文件转换中间件**
```typescript
middlewares.use(transformMiddleware(server))
```
- Vite 的核心功能
- 处理各类源文件的转换：
  - TypeScript 编译
  - JSX/TSX 转换
  - CSS 预处理
  - 静态资源处理

7. **静态文件服务**
```typescript
middlewares.use(serveRawFsMiddleware(server))
middlewares.use(serveStaticMiddleware(server))
```
- 处理静态资源请求
- 提供文件系统访问能力

8. **HTML 相关处理** (针对 SPA/MPA)
```typescript
if (config.appType === 'spa' || config.appType === 'mpa') {
  // 支持前端路由
  middlewares.use(htmlFallbackMiddleware(...))
  // 处理 HTML 转换，注入客户端代码
  middlewares.use(indexHtmlMiddleware(root, server))
  // 处理 404
  middlewares.use(notFoundMiddleware())
}
```

9. **错误处理中间件**
```typescript
middlewares.use(errorMiddleware(server, !!middlewareMode))
```
- 统一的错误处理
- 提供友好的错误提示

这个中间件链的设计体现了以下几个关键点：

1. **处理顺序的重要性**
   - CORS 需要最先处理
   - 缓存检查在转换之前
   - 错误处理放在最后

2. **性能优化**
   - 使用缓存避免重复转换
   - 静态文件直接服务

3. **开发体验**
   - 自动编译转换
   - HMR 支持
   - 友好的错误提示

4. **灵活性**
   - 可选的中间件（代理、base 路径等）
   - 支持不同的应用类型（SPA/MPA）

这样的设计使得 Vite 能够提供高效的开发服务器，同时保持良好的扩展性和灵活性。

#### 核心中间件 transformMiddleware

#### 首次请求的简易流程

在首次请求时的流程是这样的:

1. 首先浏览器请求 HTML 页面
2. 请求经过 `transformMiddleware` 但因为是 HTML 请求所以会 pass through
3. 最终由 `indexHtmlMiddleware` 处理,在返回的 HTML 中注入 `/@vite/client` 脚本标签
4. 浏览器收到 HTML 后,解析到 `/@vite/client` 脚本标签
5. 浏览器发起第二个请求获取 `/@vite/client` 
6. 这第二个请求才会被 `transformMiddleware` 处理

让我们看下相关代码:

```typescript:vite/src/node/server/middlewares/transform.ts
export function transformMiddleware(
  server: ViteDevServer,
): Connect.NextHandleFunction {
  return async function viteTransformMiddleware(req, res, next) {
    if (req.method !== 'GET') {
      return next()
    }

    // 处理 /@vite/client 请求
    if (req.url?.startsWith('/@vite/client')) {
      const clientCode = await server.transformRequest(req.url)
      return send(req, res, clientCode.code, 'js')
    }

    // ... 处理其他请求 ...
    next()
  }
}
```

所以:

1. 首次请求时 `transformMiddleware` 中不会有 `/@vite/client` 的引用
2. 只有在浏览器解析 HTML 后发起的第二个请求中,才会处理 `/@vite/client`
3. 这是一个串行的过程:HTML 注入 -> 浏览器解析 -> 请求客户端脚本 -> 转换中间件处理

这种设计使得职责分明:
- `indexHtmlMiddleware` 负责注入客户端脚本标签
- `transformMiddleware` 负责处理具体的脚本请求
