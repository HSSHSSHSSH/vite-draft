const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const chokidar = require('chokidar');

const viteBinPath = path.resolve(__dirname, '../vite/packages/vite/bin/vite.js');
const viteDistPath = path.resolve(__dirname, '../vite/packages/vite/dist');

let viteProcess = null;

// 添加延迟函数
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 修改为异步函数
async function startVite() {
  if (viteProcess) {
    viteProcess.kill();
    // 添加 1 秒延迟，确保端口被释放
    await delay(1000);
  }
  console.log('启动 Vite...');
  viteProcess = spawn('node', [viteBinPath], { stdio: 'inherit' });
}

function watchViteDist() {
  const watcher = chokidar.watch(viteDistPath, {
    ignored: /(^|[\/\\])\../, // 忽略隐藏文件
    persistent: true
  });

  watcher.on('change', async (path) => {
    console.log(`检测到文件变化: ${path}`);
    await startVite();  // 使用 await 等待启动完成
  });

  console.log(`正在监听 ${viteDistPath} 的变化...`);
}

// 修改为异步调用
(async () => {
  await startVite();
  watchViteDist();
})();

process.on('SIGINT', () => {
  if (viteProcess) {
    viteProcess.kill();
  }
  process.exit();
});