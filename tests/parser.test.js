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

o("it adds semicolons to the end", function (done) {
  var file = __dirname + '/fixtures/minimal.css'
  gather(file, function (err, data) {
    o(err).equals(null) `no error`
    o(data).equals('a { color: red; }\n;\n;')
    done()
  })
})

o("it gracefully handles missing inline imports", function (done) {
  var file = __dirname + '/fixtures/bad-inline-import.css'
  gather(file, function (err, data) {
    o(err).equals(null) `no error`
    o(data && data.includes('import (inline) error')).equals(true) `error message interpolated`

    o(data && data.includes('@import (inline) "./a.css"')).equals(false) `a.css was inlined (1)`
    o(data && data.includes('a { color: red; }')).equals(true) `a.css was inlined (2)`

    o(data && data.includes('@import (inline) "./b.css"')).equals(false) `bt.css was inlined (1)`
    o(data && data.includes('b { color: blue; }')).equals(true) `b.css was inlined (2)`
    done()
  })
})
