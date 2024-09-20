import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { editConfigPlugin } from './myPlugins/hook_config.ts'
import  virtual  from './myPlugins/virtual-module.ts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), virtual()],
})
