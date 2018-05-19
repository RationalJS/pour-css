#!/usr/bin/env node
var Pour = require('./index.js')
var path = require('path')

var entry = path.resolve(process.cwd(), process.argv[2])
Pour.bundle(entry).pipe(process.stdout)
