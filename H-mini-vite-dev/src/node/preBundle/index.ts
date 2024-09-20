import { build } from 'esbuild';
import path from 'path';
import { green } from 'picocolors';
import {scanDepsPlugin} from '../preBundle/plugin/scanDeps'
import {preBundlePlugin} from '../preBundle/plugin/preBundle'
import { PRE_BUNDLE_DIR } from '../constants';

export async function preBundle(root: string) {
  // 确定入口文件
  const entryPath = path.resolve(root, 'src/main.tsx')
  // 扫描第三方依赖
  const deps = new Set<string>()
  await build({
    entryPoints: [entryPath],
    bundle: true,
    format: 'esm',
    splitting: false,
    plugins: [scanDepsPlugin(deps)]
  })
  console.log(
    `${green('需要预构建的依赖')}:\n${[...deps]
      .map(green)
      .map((item) => `  ${item}`)
      .join('\n')}`,
  )
  // 依赖打包进一个模块
  await build({
    entryPoints: [...deps],
    bundle: true,
    format: 'esm',
    splitting: false,
    outdir: path.resolve(root, PRE_BUNDLE_DIR),
    plugins: [preBundlePlugin(deps)]
  })
}