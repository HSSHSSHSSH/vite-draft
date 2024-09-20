# vite

## 前端工程化的痛点

- 模块化需求
- 静态资源的加载
- 兼容浏览器，编译高级语法
- 开发环境与生产环境
- 开发效率，主要包括冷启动、二次启动、热更新

## 样式方案的必要性与一些解决方案

### 必要性

- 开发体验，eg：css 不支持嵌套语法，选择器过多
- 样式污染
- 浏览器兼容，某一些样式在不同的浏览器中可能需要添加不同的前缀
- 打包后的代码体积，所有的 css 代码都将打包到同一个产物中

### 解决方案

- Css 预处理器，例如 Sass/Scss，Less 等，自定义了一套语法，使得 Css 的编写更易读
- Css Modules，将 Css 的类名处理成哈希值，避免样式污染的问题

- Css 后处理器，如 PostCSS 可根据不同浏览器加上不同前缀等
- Css In Js，例如 emotion，styled-components，可以在 js 中编写 Css
- Css 原子化框架，如 Tailwind Css，主要提升了开发体验

## 预构建

- 将其他格式，如 CommonJs 的产物转化为 ESM 格式
- 打包第三方库的代码，将第三方库中分散的依赖文件合并到一起，减少 HTTP 的请求数量 (在 vite 中，一个 import 会触发一次 http 请求)。

以上均由 ESBuild 完成。

## ESBuild 在 vite 中的作用

- 依赖项预构建：详细如上述
- 在依赖预构建阶段对单文件进行编译：完成对 JS(X)/TS(X) 的单文件编译，代替 Babel 与 TSC，ESBuild 在处理 TS(X) 文件时，仅是删除了与类型相关的代码，故不可在编译阶段检测出类型的异常，若需要检测类型，还是需要结束 TSC
- 在生产环境下压缩代码：

## Rollup 工作流程与插件机制

### 工作流程

<strong>Input &rarr;  build &rarr; output</strong>

核心流程是 build 与 output

build：分析模块内容与依赖关系，生成 bundle 对象，暴露 generate 与 write 方法

output：调用 generate 或 write 方法完成输出，generate 与 write 的区别在于是否将产物写入磁盘

## vite 与 Rollup hook

### 通用 hook

在开发阶段，vite 会依次触发一些与 Rollup 兼容的 hook:

- 服务器启动阶段：options、buildStart
- 请求响应阶段：依次调用 resolvedId、load、transform
- 服务器关闭阶段：依次调用 buildEnd、closeBundle

除以上 hook ，vite 不会调用除以上的 Rollup hook。

在生产环境下，vite 直接使用 Rollup，故会触发 Rollup 的所有 hook。

### vite 独有的 hook

- config：在读取配置文件之后，拿到用户导出的配置对象，触发 config hook。
- configResolved：在解析完配置后触发，用于记录最终的配置项，此 hook 中不要在修改配置项
- configureServer：仅在开发阶段触发，用于扩展 vite 的 dev server，多用于自定义 server 中间件

       ```ts
       const myPlugin = () => ({
         name: 'configure-server',
         configureServer(server) {
           // 姿势 1: 在 Vite 内置中间件之前执行
           server.middlewares.use((req, res, next) => {
             // 自定义请求处理逻辑
           })
           // 姿势 2: 在 Vite 内置中间件之后执行 
           return () => {
             server.middlewares.use((req, res, next) => {
               // 自定义请求处理逻辑
             })
           }
         }
       })
       
       ```

- transformIndexHtml：在拿到 html 内容后触发
- handleHotUpdate：热更新时触发

## vite hook 顺序

- 服务启动阶段：依次触发 config、configResolved、options、configureServer、buildStart
- 请求响应阶段：
  - 若是 html 文件，触发 transformIndexHtml
  - 若非 html 文件，依次触发 resolveId、load、transform
- 热更新阶段：触发 handleHotUpdate
- 服务关闭阶段：依次触发 buildEnd、closeBundle

## vite 插件执行顺序

- Alias 插件，即路径别名相关的插件
- enforce: pre 的用户插件
- vite 核心插件
- 未设置 enforce 的用户插件
- vite 生产环境构建用的插件
- enforce: post 的用户插件
- vite 后置插件，如压缩插件

## vite HMR API 使用

```ts
interface ImportMeta {
  readonly hot?: {
    readonly data: any
    accept(): void
    accept(cb: (mod: any) => void): void
    accept(dep: string, cb: (mod: any) => void): void
    accept(deps: string[], cb: (mods: any[]) => void): void
    prune(cb: () => void): void
    dispose(cb: (data: any) => void): void
    decline(): void
    invalidate(): void
    on(event: string, cb: (...args: any[]) => void): void
  }
}

```

ImportMeta 为现代浏览器中内置的对象，vite 在 ImportMeta 的 hot 属性上定义了 HMR API，在使用时，调用 import.meta.hot.accept

以下介绍一些 API 的使用方式：

### hot.accept

vite 进行热更新的边界，传入的参数决定热更新的边界，有：

- 接受自身模块的热更新
- 接受某个子模块的热更新‘
- 接受多个子模块的热更新

#### 接受自身模块的热更新

当前模块被认为时 HMR 的边界，仅更新自身模块。

```ts
if(import.meta.hot) {
  import.meta.hot.accept((mod: any) => {
    return mod.render()
  })
}
```



import.meta.hot 对象仅在开发阶段才会注入全局





#### 接受某个子模块的热更新

#### 接受多个子模块的热更新

## 代码分包 code splitting

### 为何需要 code splitting

- 按需加载

- 提升缓存命中率

## my-vite

- esbuild插件中的 buiild.onResolve 是钩子函数

```ts
 {
    name: "esbuild:scan-deps",
    setup(build) {
      // 忽略的文件类型
      build.onResolve(
        { filter: new RegExp(`\\.(${EXTERNAL_TYPES.join("|")})$`) },
        (resolveInfo) => {
          return {
            path: resolveInfo.path,
            // 打上 external 标记
            external: true,
          };
        }
      );
      // 记录依赖
      build.onResolve(
        {
          filter: BARE_IMPORT_RE,
        },
        (resolveInfo) => {
          const { path: id } = resolveInfo;
          // 推入 deps 集合中
          deps.add(id);
          return {
            path: id,
            external: true,
          };
        }
      );
    },
  };
```

- vite 是在建立在 esbuild 与 rollup 上的，需要分清哪里是 vite 的作用，哪里是 esbuild 的作用，哪里是 rollup 的作用 	
