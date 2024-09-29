import { Plugin } from "../plugin"
import { cleanUrl, removeImportQuery, isWindows } from "../utils"
/**
 * 
 * 这段代码定义了一个名为 assetPlugin 的函数,它返回一个 Vite 插件。这个插件主要用于处理资源文件,特别是 SVG 文件。以下是代码的主要功能:
  插件名称设置为 "vite:asset"。
  定义了一个异步的 load 钩子函数,用于处理模块加载。
  使用 cleanUrl 和 removeImportQuery 函数清理输入的文件 ID (通常是文件路径),移除可能存在的查询参数。
  检查清理后的 ID 是否以 ".svg" 结尾,只处理 SVG 文件。
  如果是 Windows 系统 (isWindows 为 true),对路径进行特殊处理:
  移除驱动器前缀(如 'E:\\')
  将单反斜杠替换为双反斜杠,这是为了在 JavaScript 字符串中正确表示路径
  最后,将处理后的 SVG 文件路径包装成一个 JavaScript 模块,通过 export default 导出。
  这个插件的主要作用是将 SVG 文件转换为可导入的 JavaScript 模块,
  使得在 Vite 项目中可以直接导入 SVG 文件,并获得文件的路径。
  这种处理方式使得 SVG 文件可以像普通的 JavaScript 模块一样被引用和使用。
 */
export function assetPlugin(): Plugin {
  return {
    name: "vite:asset",
    async load(id) {
      // 清理 URL,移除查询参数
      let cleanedId = removeImportQuery(cleanUrl(id))
      // 仅处理 SVG 文件
      if (cleanedId.endsWith(".svg")) {
        // Windows 系统路径处理
        if (isWindows) {
          // 移除驱动器前缀(如 'E:\\')并将反斜杠替换为双反斜杠
          cleanedId = cleanedId.replace('E:\\', '').replace(/\\/g, '\\\\')
        }
        console.log('cleanedId', cleanedId)
        return {
          // 将 SVG 文件路径包装成 JS 模块导出
          code: `export default "${cleanedId}"`
        }
      }
    }
  }
}