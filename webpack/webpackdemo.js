const webpack  = require('webpack')
const config = require('./webpack.config')

const compiler = webpack(config) 	//new webpack.ProvideCleanup()	//adds js-related global variables to the global namespace

Object.keys(compiler.hooks).forEach(hookName=>{
  compiler.hooks[hookName].tap('xxx',(compilation)=>{
    console.log(`run------------>${hookName}`)
  })
})

compiler.run()