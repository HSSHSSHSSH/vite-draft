import { PartialResolvedId, TransformResult } from 'rollup'
import { cleanUrl } from './utils'

// ModuleNode 类表示模块图中的一个节点
export class ModuleNode {
  url: string;
  id: string | null = null;
  importers = new Set<ModuleNode>(); // 依赖当前模块的模块集合
  importedModules = new Set<ModuleNode>(); // 当前模块依赖的模块集合
  transformResult: TransformResult | null = null; // 模块转换结果
  lastHMRTimestamp = 0; // 最后一次热更新的时间戳
  constructor(url: string) {
    this.url = url
  }
}

// ModuleGraph 类用于管理整个模块依赖图
export class ModuleGraph {
  urlToModuleMap = new Map<string, ModuleNode>(); // URL 到 ModuleNode 的映射
  idToModuleMap = new Map<string, ModuleNode>(); // ID 到 ModuleNode 的映射
  /**
   * 
   * 使用 `private` 关键字意味着这个参数会自动成为类的私有属性。
   * 这是 TypeScript 的一个简写语法
   * 等同于在类中声明一个私有属性并在构造函数中赋值。
   */
  constructor(
    private resolveId:(url: string) => Promise<PartialResolvedId | null>
  ){}

  // 解析模块 ID
  private async _resolve(url: string): Promise<{url: string, resolvedId: string}> {
    const resolved = await this.resolveId(url)
    const resolvedId = resolved?.id || url
    return {
      url,
      resolvedId
    }
  }

  // 通过 ID 获取模块
  getModuleById(id: string): ModuleNode | undefined {
    return this.idToModuleMap.get(id)
  }

  // 通过 URL 获取模块
  async getModuleByUrl(rawUrl: string): Promise<ModuleNode | undefined> {
    const {url} = await this._resolve(rawUrl)
    return this.urlToModuleMap.get(url)
  }

  // 确保 URL 对应的模块存在，如果不存在则创建
  async ensureEntryFromUrl(rawUrl: string): Promise<ModuleNode> {
    const {url, resolvedId} = await this._resolve(rawUrl)
    if(this.urlToModuleMap.has(url)) {
      return this.urlToModuleMap.get(url) as ModuleNode
    }
    const mod = new ModuleNode(url)
    mod.id = resolvedId
    this.urlToModuleMap.set(url, mod)
    this.idToModuleMap.set(resolvedId, mod)
    return mod
  }

  // 更新模块信息，包括导入的模块
  async updateModuleInfo(
    mod: ModuleNode,
    importedModules: Set<string | ModuleNode>
  ) {
    const prevImports = mod.importedModules
    for(const curImports of importedModules) {
      const dep = 
        typeof curImports === 'string'
        ? await this.ensureEntryFromUrl(curImports)
        : curImports
      if(dep) {
        mod.importedModules.add(dep)
        dep.importers.add(mod)
      }
    }
    // 清除不再引用的依赖
    for(const prevImport of prevImports){
      if(!importedModules.has(prevImport.url)) {
        prevImport.importers.delete(mod)
      }
    }
  }

  // 使模块失效，通常用于热更新
  invalidateModule(file: string) {
    const mod = this.idToModuleMap.get(file)
    if(mod) {
      mod.lastHMRTimestamp = Date.now()
      mod.transformResult = null
      mod.importers.forEach((importer) => {
        this.invalidateModule(importer.id! as string)
      })
    }
  }

}