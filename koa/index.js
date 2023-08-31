const Koa = require('koa')
const Router = require('koa-router')
const router = new Router()
const app = new Koa()
router.get('/', async (ctx) => {
  ctx.body = 'hello koa'
})
app.use(router.routes())

// app.use((ctx, next) => {
//   // throw new Error('koa error')
//   // console.log(ctx.query.name)
//   // console.log(ctx.header)
//   ctx.status = 301
//   // ctx.set('location','http://www.baidu.com')
//   ctx.body = 'hello koa'
// })


app.listen(3000, () => {
  console.log('[demo] is starting at port 3000')
})
