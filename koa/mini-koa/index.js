const Koa = require('./mini-koa')

const app = new Koa()
app.use(async (ctx, next) => {
  ctx.body = 'ha111666'
  console.log('1')
  await next()
  console.log('3')
})
app.use((ctx) => {
  console.log('2')
  ctx.body = '123'
})

app.listen(3001, () => {
  console.log('app server start')
})
