// 入口 html 的加载
import {NextHandleFunction} from 'connect'
import { ServerContext } from '../index'
import path from 'path'
import { pathExists, readFile } from 'fs-extra'
import { yellow } from 'picocolors'
export function IndexHtmlMiddleware(
  serverContext: ServerContext
): NextHandleFunction {
  console.log('IndexHtmlMiddleware')
  return async (req, res, next) => {
    console.log(yellow('IndexHtmlMiddleware trigger'), req.url)
    if(req.url === '/') {
      const {root} = serverContext
      const indexHtmlPath = path.join(root, 'index.html')
      if(await pathExists(indexHtmlPath)) {
        const rawHtml = await readFile(indexHtmlPath, 'utf-8')
        let html = rawHtml
        for(const plugin of serverContext.plugins) {
          if(plugin.transformIndexHtml) {
            html = await plugin.transformIndexHtml(html)
          }
        }
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/html')
        return res.end(html)
      }
    }
    return next()
  }
}