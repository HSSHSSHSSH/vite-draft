import path from 'path'


export const BARE_IMPORT_RE = /^[\w@][^:]/;

export const PRE_BUNDLE_DIR = path.join("node_modules", ".m-vite");