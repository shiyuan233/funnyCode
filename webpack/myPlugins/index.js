class MyPlugin {
  constructor(options) {
    console.log(options)
  }
  apply(compiler){
    compiler.hooks.emit.tapAsync('xxxx',(compilation,callback)=>{
      console.log(compilation.assets)
      callback()
    })
  }
}
module.exports = MyPlugin
