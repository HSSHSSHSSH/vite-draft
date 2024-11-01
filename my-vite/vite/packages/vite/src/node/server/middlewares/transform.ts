import path from 'node:path'
import fsp from 'node:fs/promises'
import type { Connect } from 'dep-types/connect'
import colors from 'picocolors'
import type { ExistingRawSourceMap } from 'rollup'
import type { ViteDevServer } from '..'
import {
  createDebugger,
  fsPathFromId,
  injectQuery,
  isImportRequest,
  isJSRequest,
  normalizePath,
  prettifyUrl,
  rawRE,
  removeImportQuery,
  removeTimestampQuery,
  urlRE,
} from '../../utils'
import { send } from '../send'
import { ERR_LOAD_URL, transformRequest } from '../transformRequest'
import { applySourcemapIgnoreList } from '../sourcemap'
import { isHTMLProxy } from '../../plugins/html'
import {
  DEP_VERSION_RE,
  ERR_FILE_NOT_FOUND_IN_OPTIMIZED_DEP_DIR,
  ERR_OPTIMIZE_DEPS_PROCESSING_ERROR,
  ERR_OUTDATED_OPTIMIZED_DEP,
  FS_PREFIX,
} from '../../constants'
import {
  isCSSRequest,
  isDirectCSSRequest,
  isDirectRequest,
} from '../../plugins/css'
import { ERR_CLOSED_SERVER } from '../pluginContainer'
import { cleanUrl, unwrapId, withTrailingSlash } from '../../../shared/utils'
import { NULL_BYTE_PLACEHOLDER } from '../../../shared/constants'
import { ensureServingAccess } from './static'

const debugCache = createDebugger('vite:cache')

const knownIgnoreList = new Set(['/', '/favicon.ico'])

/**
 * A middleware that short-circuits the middleware chain to serve cached transformed modules
 */
export function cachedTransformMiddleware(
  server: ViteDevServer,
): Connect.NextHandleFunction {
  // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
  return function viteCachedTransformMiddleware(req, res, next) {
    const environment = server.environments.client

    // check if we can return 304 early
    const ifNoneMatch = req.headers['if-none-match']
    if (ifNoneMatch) {
      const moduleByEtag = environment.moduleGraph.getModuleByEtag(ifNoneMatch)
      if (
        moduleByEtag?.transformResult?.etag === ifNoneMatch &&
        moduleByEtag?.url === req.url
      ) {
        // For CSS requests, if the same CSS file is imported in a module,
        // the browser sends the request for the direct CSS request with the etag
        // from the imported CSS module. We ignore the etag in this case.
        const maybeMixedEtag = isCSSRequest(req.url!)
        if (!maybeMixedEtag) {
          debugCache?.(`[304] ${prettifyUrl(req.url!, server.config.root)}`)
          res.statusCode = 304
          return res.end()
        }
      }
    }

    next()
  }
}

export function transformMiddleware(
  server: ViteDevServer,
): Connect.NextHandleFunction {
  // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
  // 保持命名函数。该名称在使用 `DEBUG=connect:dispatcher ...` 时在调试日志中可见

  // check if public dir is inside root dir
  // 检查 public 目录是否在根目录内
  const { root, publicDir } = server.config
  console.log('root', root)
  console.log('publicDir', publicDir)
  console.log('withTrailingSlash(root)', withTrailingSlash(root))
  const publicDirInRoot = publicDir.startsWith(withTrailingSlash(root))
  console.log('publicDirInRoot', publicDirInRoot)
  // 计算相对于根目录的 public 路径
  const publicPath = `${publicDir.slice(root.length)}/`
  console.log('publicPath', publicPath)
  return async function viteTransformMiddleware(req, res, next) {
    // 获取默认的客户端环境实例
    const environment = server.environments.client

    if (req.method !== 'GET' || knownIgnoreList.has(req.url!)) {
      return next()
    }

    let url: string
    try {
      // 处理 URL 编码和特殊字符
      url = decodeURI(removeTimestampQuery(req.url!)).replace(
        NULL_BYTE_PLACEHOLDER,
        '\0',
      )
    } catch (e) {
      return next(e)
    }

    // 移除查询参数获取干净的 URL
    const withoutQuery = cleanUrl(url)

    try {
      const isSourceMap = withoutQuery.endsWith('.map')
      // since we generate source map references, handle those requests here
      // 由于我们生成了 source map 引用，在这里处理这些请求
      if (isSourceMap) {
        const depsOptimizer = environment.depsOptimizer
        if (depsOptimizer?.isOptimizedDepUrl(url)) {
          // If the browser is requesting a source map for an optimized dep, it
          // means that the dependency has already been pre-bundled and loaded
          // 如果浏览器请求优化依赖的 source map，说明该依赖已经预打包并加载完成
          const sourcemapPath = url.startsWith(FS_PREFIX)
            ? fsPathFromId(url)
            : normalizePath(path.resolve(server.config.root, url.slice(1)))
          try {
            // 读取并解析 sourcemap 文件
            const map = JSON.parse(
              await fsp.readFile(sourcemapPath, 'utf-8'),
            ) as ExistingRawSourceMap

            applySourcemapIgnoreList(
              map,
              sourcemapPath,
              server.config.server.sourcemapIgnoreList,
              server.config.logger,
            )

            return send(req, res, JSON.stringify(map), 'json', {
              headers: server.config.server.headers,
            })
          } catch {
            // Outdated source map request for optimized deps, this isn't an error
            // but part of the normal flow when re-optimizing after missing deps
            // Send back an empty source map so the browser doesn't issue warnings
            // 过期的优化依赖 source map 请求，这不是错误，而是重新优化缺失依赖时的正常流程
            // 返回空的 source map 以避免浏览器发出警告
            const dummySourceMap = {
              version: 3,
              file: sourcemapPath.replace(/\.map$/, ''),
              sources: [],
              sourcesContent: [],
              names: [],
              mappings: ';;;;;;;;;',
            }
            return send(req, res, JSON.stringify(dummySourceMap), 'json', {
              cacheControl: 'no-cache',
              headers: server.config.server.headers,
            })
          }
        } else {
          // 处理非优化依赖的 sourcemap
          const originalUrl = url.replace(/\.map($|\?)/, '$1')
          const map = (
            await environment.moduleGraph.getModuleByUrl(originalUrl)
          )?.transformResult?.map
          if (map) {
            return send(req, res, JSON.stringify(map), 'json', {
              headers: server.config.server.headers,
            })
          } else {
            return next()
          }
        }
      }

      // 检查并警告 public 路径的使用
      if (publicDirInRoot && url.startsWith(publicPath)) {
        warnAboutExplicitPublicPathInUrl(url)
      }

      // 检查文件访问权限
      if (
        (rawRE.test(url) || urlRE.test(url)) &&
        !ensureServingAccess(url, server, res, next)
      ) {
        return
      }
      console.log('url', url, 'jsRequest', isJSRequest(url), 'importReq', isImportRequest(url), 'cssReq', isCSSRequest(url),'htmlProxyReq', isHTMLProxy(url))
      // 处理各种类型的请求
      if (
        isJSRequest(url) ||
        isImportRequest(url) ||
        isCSSRequest(url) ||
        isHTMLProxy(url)
      ) {
        // strip ?import
        // 移除 ?import 查询参数
        url = removeImportQuery(url)
        // Strip valid id prefix. This is prepended to resolved Ids that are
        // not valid browser import specifiers by the importAnalysis plugin.
        // 移除有效的 id 前缀。这是由 importAnalysis 插件为不是有效浏览器导入说明符的已解析 Id 添加的
        url = unwrapId(url)

        // for CSS, we differentiate between normal CSS requests and imports
        // 对于 CSS，我们区分普通 CSS 请求和导入
        if (isCSSRequest(url)) {
          if (
            req.headers.accept?.includes('text/css') &&
            !isDirectRequest(url)
          ) {
            url = injectQuery(url, 'direct')
          }

          // check if we can return 304 early for CSS requests. These aren't handled
          // by the cachedTransformMiddleware due to the browser possibly mixing the
          // etags of direct and imported CSS
          // 检查是否可以为 CSS 请求提前返回 304。这些请求不由 cachedTransformMiddleware 处理，
          // 因为浏览器可能混合了直接和导入的 CSS 的 etags
          const ifNoneMatch = req.headers['if-none-match']
          if (
            ifNoneMatch &&
            (await environment.moduleGraph.getModuleByUrl(url))?.transformResult
              ?.etag === ifNoneMatch
          ) {
            debugCache?.(`[304] ${prettifyUrl(url, server.config.root)}`)
            res.statusCode = 304
            return res.end()
          }
        }
        console.log('url222', url)
        // resolve, load and transform using the plugin container
        // 使用插件容器解析、加载和转换
        const result = await transformRequest(environment, url, {
          html: req.headers.accept?.includes('text/html'),
        })
        if (result) {
          const depsOptimizer = environment.depsOptimizer
          // 确定响应类型
          const type = isDirectCSSRequest(url) ? 'css' : 'js'
          // 检查是否为依赖请求
          const isDep =
            DEP_VERSION_RE.test(url) || depsOptimizer?.isOptimizedDepUrl(url)
          return send(req, res, result.code, type, {
            etag: result.etag,
            // allow browser to cache npm deps!
            // 允许浏览器缓存 npm 依赖！
            cacheControl: isDep ? 'max-age=31536000,immutable' : 'no-cache',
            headers: server.config.server.headers,
            map: result.map,
          })
        }
      }
    } catch (e) {
      if (e?.code === ERR_OPTIMIZE_DEPS_PROCESSING_ERROR) {
        // Skip if response has already been sent
        // 如果响应已经发送则跳过
        if (!res.writableEnded) {
          res.statusCode = 504 // status code request timeout
          res.statusMessage = 'Optimize Deps Processing Error'
          res.end()
        }
        // This timeout is unexpected
        // 这个超时是意外的
        server.config.logger.error(e.message)
        return
      }
      if (e?.code === ERR_OUTDATED_OPTIMIZED_DEP) {
        // Skip if response has already been sent
        // 如果响应已经发送则跳过
        if (!res.writableEnded) {
          res.statusCode = 504 // status code request timeout
          res.statusMessage = 'Outdated Optimize Dep'
          res.end()
        }
        // We don't need to log an error in this case, the request
        // is outdated because new dependencies were discovered and
        // the new pre-bundle dependencies have changed.
        // A full-page reload has been issued, and these old requests
        // can't be properly fulfilled. This isn't an unexpected
        // error but a normal part of the missing deps discovery flow
        // 在这种情况下我们不需要记录错误，请求过期是因为发现了新的依赖，
        // 并且新的预打包依赖已经改变。已经触发了完整页面重载，
        // 这些旧请求无法正确完成。这不是意外错误，而是缺失依赖发现流程的正常部分
        return
      }
      if (e?.code === ERR_CLOSED_SERVER) {
        // Skip if response has already been sent
        // 如果响应已经发送则跳过
        if (!res.writableEnded) {
          res.statusCode = 504 // status code request timeout
          res.statusMessage = 'Outdated Request'
          res.end()
        }
        // We don't need to log an error in this case, the request
        // is outdated because new dependencies were discovered and
        // the new pre-bundle dependencies have changed.
        // A full-page reload has been issued, and these old requests
        // can't be properly fulfilled. This isn't an unexpected
        // error but a normal part of the missing deps discovery flow
        // 在这种情况下我们不需要记录错误，请求过期是因为发现了新的依赖，
        // 并且新的预打包依赖已经改变。已经触发了完整页面重载，
        // 这些旧请求无法正确完成。这不是意外错误，而是缺失依赖发现流程的正常部分
        return
      }
      if (e?.code === ERR_FILE_NOT_FOUND_IN_OPTIMIZED_DEP_DIR) {
        // Skip if response has already been sent
        // 如果响应已经发送则跳过
        if (!res.writableEnded) {
          res.statusCode = 404
          res.end()
        }
        server.config.logger.warn(colors.yellow(e.message))
        return
      }
      if (e?.code === ERR_LOAD_URL) {
        // Let other middleware handle if we can't load the url via transformRequest
        // 如果我们无法通过 transformRequest 加载 url，让其他中间件处理
        return next()
      }
      return next(e)
    }

    next()
  }

  // 用于生成警告消息的辅助函数
  function warnAboutExplicitPublicPathInUrl(url: string) {
    let warning: string

    if (isImportRequest(url)) {
      const rawUrl = removeImportQuery(url)
      if (urlRE.test(url)) {
        warning =
          `Assets in the public directory are served at the root path.\n` +
          `Instead of ${colors.cyan(rawUrl)}, use ${colors.cyan(
            rawUrl.replace(publicPath, '/'),
          )}.`
      } else {
        warning =
          'Assets in public directory cannot be imported from JavaScript.\n' +
          `If you intend to import that asset, put the file in the src directory, and use ${colors.cyan(
            rawUrl.replace(publicPath, '/src/'),
          )} instead of ${colors.cyan(rawUrl)}.\n` +
          `If you intend to use the URL of that asset, use ${colors.cyan(
            injectQuery(rawUrl.replace(publicPath, '/'), 'url'),
          )}.`
      }
    } else {
      warning =
        `Files in the public directory are served at the root path.\n` +
        `Instead of ${colors.cyan(url)}, use ${colors.cyan(
          url.replace(publicPath, '/'),
        )}.`
    }

    server.config.logger.warn(colors.yellow(warning))
  }
}
