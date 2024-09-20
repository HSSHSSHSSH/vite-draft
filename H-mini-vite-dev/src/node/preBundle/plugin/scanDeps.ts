

import {Plugin} from 'esbuild'
import {BARE_IMPORT_RE} from '../../constants'

export function scanDepsPlugin(deps: Set<string>): Plugin {
  return {
    name: 'my-vite:scanDepsPlugin',
    setup(build) {
        build.onResolve(
          {filter: BARE_IMPORT_RE},
          (resolveInfo) => {
            deps.add(resolveInfo.path)
            return {
              external: true
            }
          }
        ) 
    },
  }
}