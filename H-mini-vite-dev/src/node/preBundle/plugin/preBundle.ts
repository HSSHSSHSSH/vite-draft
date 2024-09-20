

import { Plugin } from 'esbuild'
import { BARE_IMPORT_RE } from '../../constants'

export function preBundlePlugin(deps: Set<string>): Plugin {
  return {
    name: 'my-vite:preBundlePlugin',
    setup(build) {
      build.onResolve(
        {filter: BARE_IMPORT_RE},
        (resolveInfo) => {
          console.log('进行 resolve')
          console.log(resolveInfo)
          return null
        }
      ),
      build.onLoad(
        {
          filter: /.*/,
        },
        (loadInfo) => {
          // console.log('进行 load')
          // console.log(loadInfo)
          return null
        }
      ) 
    },
  }
}