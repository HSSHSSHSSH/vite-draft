import {
  LoadResult,
  PartialResolvedId,
  SourceDescription,
  PluginContext as RollupPluginContext,
  ResolvedId,
} from 'rollup'
import { Plugin } from './plugin'

export interface PluginContainer {
  resolveId(id: string, importer?: string): Promise<PartialResolvedId | null>
  load(id: string): Promise<LoadResult | null>
  transform(code: string, id: string): Promise<SourceDescription>
}

// 创建插件容器，模拟 rollup 的插件机制
export const createPluginContainer = (plugins: Plugin[]): PluginContainer => {
  // 创建一个模拟的 Rollup 插件上下文
  // @ts-ignore
  class Context implements RollupPluginContext {
    async resolve(id: string, importer?: string) {
      // 调用插件容器的 resolveId 方法
      let out = await pluginContainer.resolveId(id, importer)
      if (typeof out === 'string') out = { id: out }
      return null
    }
  }

  const pluginContainer: PluginContainer = {
    // 解析模块 ID
    async resolveId(id: string, importer?: string) {
      const ctx = new Context() as any
      for (const plugin of plugins) {
        if (plugin.resolveId) {
          // 依次调用每个插件的 resolveId 方法
          const newId = await plugin.resolveId.call(ctx as any, id, importer)
          if(newId) {
            // 如果有返回值，更新 id 并返回结果
            id = typeof newId === 'string' ? newId : newId.id
            return {id}
          }
        }
      }
      return null
    },

    // 加载模块内容
    async load(id) {
      const ctx = new Context() as any
      for(const plugin of plugins) {
        if(plugin.load) {
          // 依次调用每个插件的 load 方法
          const result = await plugin.load.call(ctx as any, id)
          if(result) {
            // 如果有返回值，直接返回结果
            return result
          }
        }
      }
    },

    // 转换模块代码
    async transform(code, id) {
      const ctx = new Context() as any
      for(const plugin of plugins) {
        if(plugin.transform) {
          // 依次调用每个插件的 transform 方法
          const result = await plugin.transform.call(ctx as any, code, id)
          if(!result) continue
          if(typeof result === 'string') {
            code = result
          } else if(result.code) {
            code = result.code
          }
        }
      }
      return {code}
    }
  }

  return pluginContainer
}
