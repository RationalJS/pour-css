var o = require('ospec')
var Pour = require('../index.js')

function gather (file, cb) {
  var stream = Pour.bundle(file)
  var data = ""
  stream.on('data', function (chunk) {
    data += chunk
  })
  stream.on('error', function (error) {
    cb(error)
  })
  stream.on('end', function () {
    cb(null, data)
  })
  return stream
}

o("inline import", function (done) {
  var file = __dirname + '/fixtures/index.css'
  gather(file, function (err, data) {
    o(err).equals(null) `no error`
    o(data && data.includes('b { color: blue; }')).equals(true) `read & inline import`
    o(data && data.includes('"./b.css"')).equals(false) `import b.css replaced`

    o(data && data.includes('"./a.css"')).equals(true) `import a.css left alone`
    o(data && data.includes('"./c.css"')).equals(true) `import a.css left alone`

    o(data && data.includes('a { color: red')).equals(false) `should not inline normal imports`
    done()
  })
})
