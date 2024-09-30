import { NextHandleFunction } from 'connect'
import { isImportRequest } from '../../utils'
import { italic } from 'picocolors'


// 一个用于加载静态文件的中间件
import sirv from 'sirv'

export function staticMiddleware(root: string): NextHandleFunction {
  console.log('staticMiddleware')
  const serveFromRoot = sirv('/', {dev: true})
  return async(req, res, next) => {
    console.log(italic('staticMiddleware trigger'))
    if(!req.url) {
      return
    }
    // 不处理 import 请求
    if(isImportRequest(req.url)) {
      return
    }
    serveFromRoot(req, res, next)
  }
}