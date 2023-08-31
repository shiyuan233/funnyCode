const { promisify } = require('util')
const figlet = promisify(require('figlet'))
const clear = require('clear')
const chalk = require('chalk')
const { clone } = require('../lib/download')
const log = (content) => console.log(chalk.green(content))

module.exports = async (name) => {
  // 打印欢迎界面
  clear()
  const banner = await figlet('Welcome To JHX Template Cli')
  log(banner)
  log('🚀' + name)
  await clone('')
}
