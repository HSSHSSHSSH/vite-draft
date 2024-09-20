
import connect from 'connect'
import {green, blue} from 'picocolors'
import {preBundle} from '../preBundle'

export async function startServer() {
  const app = connect()
  const startTime = Date.now()
  app.listen(3000, async () => {
    await preBundle(process.cwd())
    console.log(green(`Server started in ${Date.now() - startTime}ms`))
    console.log(blue(`Server running at http://localhost:3000`))
  })
}