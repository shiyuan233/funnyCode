const path = require('path')
const fs = require('fs')
const BabelParser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const { transformFromAst } = require('@babel/core')
module.exports = class Webpack {
  constructor(config) {
    this.config = config
    this.entry = config.entry
    this.output = config.output
    this.moduleInfo = []
  }
  run() {
    const moduleParserInfo = this.parser(this.entry)
    this.moduleInfo.push(moduleParserInfo)
    for (let i = 0; i < this.moduleInfo.length; i++) {
      const dependencies = this.moduleInfo[i].dependence
      if (dependencies) {
        for (let j in dependencies) {
          this.moduleInfo.push(this.parser(dependencies[j]))
        }
      }
    }
    let dependencies = {}
    this.moduleInfo.forEach((module) => {
      dependencies[module.modulePath] = module
    })
    console.log(dependencies)
    this.createBundleFile(dependencies)
  }
  createBundleFile(dependence) {
    const filePath = path.join(this.output.path, this.output.filename)
    const dependencies = JSON.stringify(dependence)
    const content = `(function(moduleInfo){
      let exports = {};
      function require(modulePath){
        function newRequire(path){
          return require(moduleInfo[modulePath]["dependence"][path])
        }
        (function(require,code){
          eval(code)
        })(newRequire,moduleInfo[modulePath].code)
        return exports
      }
      require('${this.entry}')
      
    })(${dependencies})`
    if (!fs.existsSync(this.output.path)) {
      fs.mkdirSync(this.output.path)
    }
    fs.writeFileSync(filePath, content, 'utf-8')
  }
  parser(modulePath) {
    // 获取到入口文件内容
    const content = fs.readFileSync(modulePath, 'utf8')
    const ast = BabelParser.parse(content, {
      sourceType: 'module',
    })
    // 解析依赖
    const dependence = {}
    traverse(ast, {
      ImportDeclaration({ node }) {
        const newPath =
          './' + path.join(path.dirname(modulePath), node.source.value)
        dependence[node.source.value] = newPath
      },
    })
    const { code } = transformFromAst(ast, null, {
      presets: ['@babel/preset-env'],
    })
    return {
      modulePath,
      dependence,
      code,
    }
  }
}
