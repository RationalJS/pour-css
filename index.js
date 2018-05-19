var fs = require('fs')
var Path = require('path')
var Buffer = require('buffer').Buffer

var split = require('binary-split')
var through = require('through2')

var ws = '(?:\\r\\n?|\\n| )*'
var specialImportRe =
  new RegExp(`^${ws}@import${ws}\\(${ws}(inline)${ws}\\)${ws}"([^"]+)"${ws}$`)

var importBuf = Buffer.from('@import');
var wsBufs = [
  Buffer.from('\r\n'),
  Buffer.from('\r'),
  Buffer.from('\n'),
  Buffer.from(' ')
]
var semicolonBuf = Buffer.from(';')


module.exports = { bundle }

function bundle (file) {
  if ( ! Path.isAbsolute(file) ) {
    throw new Error('[pour-css] File path must be an absolute path')
  }

  return fs.createReadStream(file)
    .pipe(split(';'))
    .pipe(through(write))

  function write (statementBuf, enc, done) {

    //
    // Find first non-whitespace character
    //
    let offset = 0
    search:
    for (; offset < statementBuf.length; offset++) {
      for (var wsi = 0; wsi < wsBufs.length; wsi++) {
        var matcher = wsBufs[wsi]
        if (statementBuf[offset] === matcher[0]) {
          if (matcher.length > 1) {
            var fullMatch = true
            for (var j = offset, k = 0; j < offset + matcher.length; j++, k++) {
              if (statementBuf[j] !== matcher[k]) {
                fullMatch = false
                break
              }
            }
            if (fullMatch) { continue search }
          } else {
            continue search
          }
        }
      }
      // At this point none of the whitespace characters matched,
      // thus we have found our offset position. We're done here!
      break search
    }

    //
    // Only check first few bytes for @import instead of scanning the whole statement.
    // This saves a lot of time for large texts such as inline svgs.
    //
    if (
      statementBuf.length >= offset+importBuf.length &&
      statementBuf.compare(importBuf, 0, importBuf.length, offset, offset+importBuf.length) === 0
    ) {
      var match = statementBuf.toString('utf8').match(specialImportRe)
      if ( match && match[1] === 'inline' ) {
        var fileToImport = Path.resolve(Path.dirname(file), match[2])

        bundle(fileToImport)
          .on('data', (chunk) => this.push(chunk))
          .on('finish', (err) => done(err))
      }
      else {
        // No match; probably a normal import.
        this.push(statementBuf)
        done()
      }
    }
    else {
      // Pass along statement untouched (after adding back splitted semicolon)
      this.push(semicolonBuf)
      this.push(statementBuf)
      done()
    }

  } // end function write
}


