const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const chokidar = require('chokidar');

const viteBinPath = path.resolve(__dirname, '../vite/packages/vite/bin/vite.js');
const viteDistPath = path.resolve(__dirname, '../vite/packages/vite/dist');

let viteProcess = null;

function startVite() {
  if (viteProcess) {
    viteProcess.kill();
  }
  console.log('启动 Vite...');
  viteProcess = spawn('node', [viteBinPath], { stdio: 'inherit' });
}

function watchViteDist() {
  const watcher = chokidar.watch(viteDistPath, {
    ignored: /(^|[\/\\])\../, // 忽略隐藏文件
    persistent: true
  });

  watcher.on('change', (path) => {
    console.log(`检测到文件变化: ${path}`);
    startVite();
  });

  console.log(`正在监听 ${viteDistPath} 的变化...`);
}

startVite();
watchViteDist();

process.on('SIGINT', () => {
  if (viteProcess) {
    viteProcess.kill();
  }
  process.exit();
});
