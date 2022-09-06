/*
The MIT License (MIT)

Copyright (c) 2014-2022 Matteo Collina

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

'use strict'

const leven = require('./leven')

function commist (opts) {
  opts = opts || {}
  const commands = []
  const maxDistance = opts.maxDistance || Infinity

  function lookup (array) {
    if (typeof array === 'string') { array = array.split(' ') }

    return commands.map(function (cmd) {
      return cmd.match(array)
    }).filter(function (match) {
      if (match.cmd.strict && match.totalDistance > 0) {
        return false
      }
      return match.totalDistance <= maxDistance
    }).sort(function (a, b) {
      if (a.totalDistance > b.totalDistance) { return 1 }

      if (a.totalDistance === b.totalDistance && a.partsNotMatched > b.partsNotMatched) { return 1 }

      return -1
    }).map(function (match) {
      return match.cmd
    })
  }

  function parse (args) {
    const matching = lookup(args)

    if (matching.length > 0) {
      matching[0].call(args)

      // return null if there is nothing left to do
      return null
    }

    return args
  }

  function register (inputCommand, func) {
    let commandOptions = {
      command: inputCommand,
      strict: false,
      func
    }

    if (typeof inputCommand === 'object') {
      commandOptions = Object.assign(commandOptions, inputCommand)
    }

    const matching = lookup(commandOptions.command)

    matching.forEach(function (match) {
      if (match.string === commandOptions.command) { throw new Error('command already registered: ' + commandOptions.command) }
    })

    commands.push(new Command(commandOptions))

    return this
  }

  return {
    register,
    parse,
    lookup
  }
}

function Command (options) {
  this.string = options.command
  this.strict = options.strict
  this.parts = this.string.split(' ')
  this.length = this.parts.length
  this.func = options.func
}

Command.prototype.call = function call (argv) {
  this.func(argv.slice(this.length))
}

Command.prototype.match = function match (string) {
  return new CommandMatch(this, string)
}

function CommandMatch (cmd, array) {
  this.cmd = cmd
  this.partsNotMatched = 0
  this.distances = cmd.parts.map((elem, i) => {
    if (array[i] !== undefined) {
      if (cmd.strict) {
        if (elem === array[i]) {
          return 0
        } else {
          this.partsNotMatched++
          return elem.length
        }
      } else {
        return leven(elem, array[i])
      }
    } else {
      this.partsNotMatched++
      return elem.length
    }
  })

  if (this.distances.length < array.length) {
    for (let i = this.distances.length; i < array.length; i++) {
      this.partsNotMatched++
      this.distances.push(array[i].length)
    }
  }

  this.totalDistance = this.distances.reduce(function (acc, i) { return acc + i }, 0)
}

module.exports = commist
