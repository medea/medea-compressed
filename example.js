var medea = require('medea')

  , db = require('./medea-compressed')(medea())
  , input = 'Hej hopp'

// all functions from medea ar available
db.open(function () {
  db.put('beep', input, function (err) {
    db.get('beep', function (err, data) {
      console.log('input', input)
      console.log('db.get()', data.toString())
    })
  })
})
