import path from "path";

// 定义外部类型，这些类型通常不需要被打包
export const EXTERNAL_TYPES = [
  "css",
  "less",
  "sass",
  "scss",
  "styl",
  "stylus",
  "pcss",
  "postcss",
  "vue",
  "svelte",
  "marko",
  "astro",
  "png",
  "jpe?g",
  "gif",
  "svg",
  "ico",
  "webp",
  "avif",
];

// 预打包目录路径
export const PRE_BUNDLE_DIR = path.join("node_modules", ".m-vite");

// 匹配裸模块导入的正则表达式
export const BARE_IMPORT_RE = /^[\w@][^:]/;

// 匹配 JavaScript 相关文件类型的正则表达式
export const JS_TYPES_RE = /\.(?:j|t)sx?$|\.mjs$/;

// 匹配 URL 查询参数的正则表达式
export const QEURY_RE = /\?.*$/s;

// 匹配 URL hash 的正则表达式
export const HASH_RE = /#.*$/s;

// 默认支持的文件扩展名
export const DEFAULT_EXTENSIONS = [".tsx", ".ts", ".jsx", "js"];

// HMR（热模块替换）服务器端口
export const HMR_PORT = 24678;

// Vite 客户端公共路径
export const CLIENT_PUBLIC_PATH = "/@vite/client";

// 内部模块列表
export const INTERNAL_LIST = [CLIENT_PUBLIC_PATH, "/@react-refresh"];