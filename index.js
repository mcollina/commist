/*
The MIT License (MIT)

Copyright (c) 2014 Matteo Collina

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

'use strict';

var minimist = require('minimist')

function commist() {

  var commands = []

  function lookup(parts) {
    if (typeof parts === 'string')
      parts = parts.split(' ')

    return commands.filter(function(cmd) {
      return cmd.match(parts)
    }).sort(function(a, b) {
      if (a.length > b.length)
        return -1
      else
        return 1
    })
  }

  function parse(args) {
    var argv = minimist(args)
      , matching = lookup(argv._)

    if (matching.length > 0) {
      matching[0].call(argv)

      // return null if there is nothing left to do
      return null
    }

    return argv
  }

  function register(command, func) {
    var parts     = command.split(' ')
      , matching  = lookup(parts)

    matching.forEach(function(match) {
      if (match.length === parts.length)
        throw new Error('command already registered: ' + command)
    })

    commands.push(new Command(parts, func))

    return this
  }

  return {
      register: register
    , parse: parse
    , lookup: lookup
  }
}

function Command(parts, func) {
  this.parts = parts
  this.length = parts.length
  this.func = func
}

Command.prototype.call = function call(argv) {
  var that = this
  this.func(Object.keys(argv).reduce(function(obj, key) {
    if (key === '_')
      obj._ = argv._.slice(that.length)
    else
      obj[key] = argv[key]

    return obj
  }, {}))
}

Command.prototype.match = function match(args) {
  return this.parts.reduce(function(acc, part, i) {
    return acc && part === args[i]
  }, true)
}

module.exports = commist
