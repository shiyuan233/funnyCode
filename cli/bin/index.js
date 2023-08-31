#!/usr/bin/env node
console.log('cli start!')
const {program} = require('commander')
// -V
program.version(require('../package.json')['version'])

// jhx init xxx

program
  .command('init <project-name>')
  .description('init a project')
  .action(require('../lib/init.js'))

program.parse(process.argv)

