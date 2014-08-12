commist
=======

Build command line application with multiple commands the easy way.
Built on minimist.

```js
var program = require('commist')()
  , result

result = program
  .register('do', function(args) {
    console.log('just do', args)
  })
  .register('do code', function(args) {
    console.log('doing something', args)
  })
  .register('another command', function(args) {
    console.log('anothering', args)
  })
  .parse(process.argv.splice(2))

if (result) {
  console.log('no command called, args', result)
}
```

Acknowledgements
----------------

This project was kindly sponsored by [nearForm](http://nearform.com).

License
-------

MIT
