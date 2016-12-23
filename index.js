#!/usr/bin/env node

// Native
const path = require('path')
const {execSync} = require('child_process')

// Packages
const GitHubAPI = require('github')
const args = require('args')
const {red} = require('chalk')
const byeWhitespace = require('condense-whitespace')

args.parse(process.argv)

const abort = msg => {
  console.error(`${red('Error!')} ${msg}`)
  process.exit(1)
}

const findToken = () => {
  const cmd = 'security find-internet-password -s github.com -g -w'
  let token

  try {
    token = execSync(cmd, {
      stdio: [
        'ignore',
        'pipe',
        'ignore'
      ]
    })
  } catch (err) {
    abort('Could not find GitHub token in Keychain.')
  }

  return byeWhitespace(String(token))
}

const connector = () => {
  const token = findToken()

  const github = new GitHubAPI({
    protocol: 'https',
    headers: {
      'user-agent': 'Release'
    }
  })

  github.authenticate({
    type: 'token',
    token
  })

  return github
}

const pkgPath = path.join(process.cwd(), 'package.json')
let pkg

try {
  pkg = require(pkgPath)
} catch (err) {
  abort('Could not find a package.json file.')
}

if (!pkg.repository) {
  abort('No repository field inside the package.json file.')
}

const github = connector()
console.log(github)