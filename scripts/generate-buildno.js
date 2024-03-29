const childProcess = require('child_process')
const fs = require('fs')
const os = require('os')

const setEnvValue = (_key, _value) => {
  const ENV_VARS = fs.readFileSync('./.env', 'utf8').split(os.EOL)
  const target = ENV_VARS.indexOf(
    ENV_VARS.find((line) => {
      return line.match(new RegExp(_key))
    })
  )
  ENV_VARS.splice(target, 1, `${_key}=${_value}`)
  fs.writeFileSync('./.env', ENV_VARS.join(os.EOL))
}

;(() => {
  childProcess.exec('git rev-parse --short HEAD', (err, stdout) => {
    setEnvValue('REACT_APP_GIT_SHA', stdout)
  })
})()
