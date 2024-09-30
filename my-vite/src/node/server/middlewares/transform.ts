/**
 * 这个文件主要包含两个重要的函数:
1.transformRequest: 这个函数负责实际的转换过程。
它首先检查模块是否已经有转换结果,如果有就直接返回。
否则,它会解析模块 ID,加载代码,然后使用插件容器进行转换。最后,它会缓存转换结果并返回。
2. transformMiddleware: 这是一个中间件函数,它处理传入的 GET 请求。
如果请求的是 JavaScript、CSS 或 import 文件,它会调用 transformRequest 函数进行转换,然后将结果作为响应发送回客户端。

这个中间件的主要作用是在开发服务器中拦截特定类型的请求,
对请求的资源进行必要的转换(例如,编译 TypeScript、处理 CSS 预处理器等),
然后将转换后的结果返回给客户端。
这样可以实现实时编译和热模块替换等功能,提高开发效率
 */
import {NextHandleFunction} from 'connect'
import {
  isJSRequest,
  cleanUrl,
  isCSSRequest,
  isImportRequest
} from '../../utils'

import { ServerContext } from '../index'
import createDebug from 'debug'
import { blackBright, bgBlue } from 'picocolors'

// 创建调试器
const debug = createDebug("dev")

// 转换请求的核心函数
export async function transformRequest (
  url: string,
  serverContext: ServerContext
) {
  const { pluginContainer, moduleGraph } = serverContext
  url = cleanUrl(url)
  let mod = await moduleGraph.getModuleByUrl(url)
  
  // 如果模块已经有转换结果,直接返回
  if(mod && mod.transformResult) {
    return mod.transformResult
  } 
  
  // 解析模块 ID
  const resolvedResult = await pluginContainer.resolveId(url)
  let transformResult
  if(resolvedResult?.id) {
    // 加载模块代码
    let code = await pluginContainer.load(resolvedResult.id)
    if(typeof code === 'object' && code !== null) {
      code = code.code
    }
    
    // 确保模块在 moduleGraph 中存在
    mod = await moduleGraph.ensureEntryFromUrl(url);
    
    // 如果有代码,则进行转换
    if(code) {
      transformResult = await pluginContainer.transform(code, resolvedResult.id)
    }
  }
  
  // 缓存转换结果
  if(mod) {
    mod.transformResult = transformResult
  }
  return transformResult
}

// 转换中间件函数
export function transformMiddleware(
  serverContext: ServerContext
): NextHandleFunction {
  console.log('transformMiddleware')
  return async (req, res, next) => {
    console.log(blackBright('transformMiddleware trigger'), req.url)
    if(req.method !== 'GET' || !req.url) {
      return next()
    }
    const url = req.url
    debug('transformMiddleware: %s', url)
    
    // 处理 JS、CSS 和 import 请求
    if(isJSRequest(url) || isCSSRequest(url) || isImportRequest(url)) {
      let result: any = await transformRequest(url, serverContext)
      if(!result) {
        return next()
      }
      if(result && typeof result !== 'string') {
        result = result.code
      }
      
      // 设置响应头和内容
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/javascript')
      console.log(bgBlue('transformMiddleware end'), url)
      return res.end(result)
    }
    return next()
  }
}