
var program = require('./')()
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
