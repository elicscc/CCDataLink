'use strict'

process.env.NODE_ENV = 'production'

const { say } = require('cfonts')
const chalk = require('chalk')
const del = require('del')
const childProcess = require('child_process')
const webpack = require('webpack')
const Multispinner = require('multispinner')
const fs = require("fs")
const {resolve} = require('path')

const mainConfig = require('./webpack.main.config')
const rendererConfig = require('./webpack.renderer.config')
const executorConfig = require('./webpack.executor.config')

const doneLog = chalk.bgGreen.white(' DONE ') + ' '
const errorLog = chalk.bgRed.white(' ERROR ') + ' '
const okayLog = chalk.bgBlue.white(' OKAY ') + ' '
const isCI = process.env.CI || false

if (process.env.BUILD_TARGET === 'clean') {
    clean()
} else if (process.env.BUILD_TARGET === 'executor') {
    buildExecutor()
} else {
    build()
}

function clean () {
  del.sync(['build/*', '!build/icons', '!build/icons/icon.*'])
  console.log(`\n${doneLog}\n`)
  process.exit()
}

function packageJava () {
  let result = childProcess.execSync("cd javasrc && mvn clean package ")
  console.log(result.toString())
  result = childProcess.execSync("copy javasrc\\target\\dataLinkDB.jar static\\dlt_db\\")
  result.toLocaleString()
  console.log(result.toString())
}

function build () {

  // 获取当前时间放入static目录下的文件中，用于生成版本号
  const buildDate = new Date()
  let month = buildDate.getMonth() + 1
  if(month < 10){
    month = "0"+month
  }
  let day = buildDate.getDate()
  if(day < 10){
    day = "0"+day
  }
  const  type = process.env.INDUSTRY === 'tob'?'B':'C'
  const buildTime = '1.0.' + month + '' + day + type
  const filespec=resolve('./')+"/static/buildTime.txt"
  fs.writeFile(filespec, buildTime, 'utf8', (err) => {
    if (err) throw err;
    console.log('success done');
  });
  packageJava()
  greeting()
  del.sync(['dist/electron/*', '!.gitkeep'])
  const tasks = ['main', 'renderer']
  const m = new Multispinner(tasks, {
    preText: 'building',
    postText: 'process'
  })
  let results = ''
  m.on('success', () => {
    process.stdout.write('\x1B[2J\x1B[0f')
    console.log(`\n\n${results}`)
    console.log(`${okayLog}take it away ${chalk.yellow('`electron-builder`')}\n`)
    // 获取当前目录下所有文件
    // encryption
    process.exit()

  })

  pack(mainConfig).then(result => {
    results += result + '\n\n'
    m.success('main')
  }).catch(err => {
    m.error('main')
    console.log(`\n  ${errorLog}failed to build main process`)
    console.error(`\n${err}\n`)
    process.exit(1)
  })

  pack(rendererConfig).then(result => {
    results += result + '\n\n'
    m.success('renderer')
  }).catch(err => {
    m.error('renderer')
    console.log(`\n  ${errorLog}failed to build renderer process`)
    console.error(`\n${err}\n`)
    process.exit(1)
  })
}

function pack (config) {
  return new Promise((resolve, reject) => {
    config.mode = 'production'
    webpack(config, (err, stats) => {
      if (err) reject(err.stack || err)
      else if (stats.hasErrors()) {
        let err = ''

        stats.toString({
          chunks: false,
          colors: true
        })
        .split(/\r?\n/)
        .forEach(line => {
          err += `    ${line}\n`
        })

        reject(err)
      } else {
        resolve(stats.toString({
          chunks: false,
          colors: true
        }))
      }
    })
  })
}

function greeting () {
  const cols = process.stdout.columns
  let text = ''

  if (cols > 85) text = 'data link transfer'
  else if (cols > 60) text = 'data link transfer'
  else text = false

  if (text && !isCI) {
    say(text, {
      colors: ['yellow'],
      font: 'simple3d',
      space: false
    })
  } else console.log(chalk.yellow.bold('\n  data link transfer'))
  console.log()
}

function buildExecutor() {
    greeting()
    const tasks = ['executor']

    const m = new Multispinner(tasks, {
        preText: 'building',
        postText: 'process'
    })

    let results = ''

    m.on('success', () => {
        process.stdout.write('\x1B[2J\x1B[0f')
        console.log(`\n\n${results}`)
        console.log(`${okayLog}take it away ${chalk.yellow('`data-link-transfer executor`')}\n`)
        process.exit()
    })
    pack(executorConfig).then(result => {
        results += result + '\n\n'
        m.success('executor')
    }).catch(err => {
        m.error('executor')
        console.log(`\n  ${errorLog}failed to build executor process`)
        console.error(`\n${err}\n`)
        process.exit(1)
    })
}
