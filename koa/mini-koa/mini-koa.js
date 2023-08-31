const http = require('http')
const context = require('./context')
const request = require('./request')
const response = require('./response')
class MiniKoa {
  constructor() {
    this.middleware = []
  }
  listen(...args) {
    const serve = http.createServer((req, res) => {
      // this.callback(req,res)
      const ctx = this.createContext(req, res)
      // this.callback(ctx)
      const fn = this.compose(this.middleware)
      fn(ctx)
      res.end(ctx.body)
    })
    serve.listen(...args)
  }
  use(callback) {
    // this.callback = callback
    this.middleware.push(callback)
  }

  createContext(req, res) {
    const ctx = Object.create(context)
    ctx.request = Object.create(request)
    ctx.response = Object.create(response)
    ctx.req = ctx.request.req = req
    ctx.res = ctx.response.res = res
    return ctx
  }

  compose(middleware) {
    return (ctx) => {
      return dispatch(0)
      function dispatch(i) {
        let fn = middleware[i]
        if (!fn) return Promise.resolve()
        return Promise.resolve(
          fn(ctx, () => {
            dispatch(i + 1)
          })
        )
      }
    }
  }
}

module.exports = MiniKoa
