// 导入 cac 库，用于创建命令行界面
import cac from "cac";
// 导入 startDevServer 函数，这个函数可能定义在 './server' 文件中
import { startDevServer } from './server'

// 创建一个新的 CLI 实例
const cli = cac()

// 定义一个命令
cli
  .command("[root]", "Run the development server")  // 设置命令名称和描述
  .alias("server")  // 添加命令别名 "server"
  .alias("dev")     // 添加命令别名 "dev"
  .action(async () => {
    // 当命令被执行时，调用这个异步函数
    await startDevServer()  // 启动开发服务器
  })

// 添加帮助信息，用户可以通过 --help 查看
cli.help()

// 解析命令行参数
cli.parse()
