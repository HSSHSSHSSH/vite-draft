const connect = require('connect');
const {blue, green} = require("picocolors")

module.exports = {
  async startServer() {
    const app = connect();
    const startTime = Date.now();
    app.listen(3000, () => {
      console.log(green(`Server started in ${Date.now() - startTime}ms`))
      console.log(blue(`http://localhost:3000`))
    })
  }
}