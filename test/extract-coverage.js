'use strict'

// from https://github.com/davidguttman/cssify/blob/master/test/extract-coverage.js

var fs = require('fs')
var path = require('path')
var concatStream = require('concat-stream')

var covPath = path.join(__dirname, '..', 'coverage', 'coverage.json')

process.stdin.pipe(concatStream(function (input) {

    input = input.toString('utf-8')
    var sp = input.split('# coverage: ')
    var output = sp[0]
    var coverage = sp[1]
    console.log(output)

    fs.writeFile(covPath, coverage, function (err) {
        if (err) console.error(err)
    })
}))
