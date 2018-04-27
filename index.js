var config = require('ssb-config')
var ssbKeys = require('ssb-keys')
var pull = require('pull-stream')

var h = require('hyperscript')
var ta = h('textarea')
var content = h('div',
  h('p', 'paste in ~/.ssb/secret, make sure local sbot is running'),
  ta
)
var keys
ta.oninput = function (ev) {
  if(keys != ta.value) {
    keys = ta.value
    connect (JSON.parse(ta.value.replace(/#[^\n]*/g, '')))
  }
}

document.body.appendChild(content)

function log (data) {
  console.log(data)
  document.body.appendChild(h('pre', 'string' === typeof data ? data : JSON.stringify(data, null, 2)))
}

function connect (keys) {
  var remote = "ws://localhost:8989~shs:" + keys.id.substring(1, keys.id.indexOf('.'))
  log('attempting connection to:' + remote+ '...')

  require('ssb-client')(
    keys,
    {
      remote: remote,
      caps: config.caps, //this is changed, if you are running alt net
      manifest: { //or copy ~/.ssb/manifest.json
        createLogStream: 'source'
      }
    }, function (err, sbot) {
      if(err) return log(err.stack)
      else log('connected!')
      pull(
        sbot.createLogStream({reverse: true, limit: 10}),
        pull.drain(function (data) {
          log(data)
        })
      )
    })
}




