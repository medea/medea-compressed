var test = require('tape')
  , inner
  , db
  , directory = __dirname + '/data'

test('setup default', function (t) {
  require('rimraf').sync(directory)

  inner = require('medea')()
  db = require('./medea-compressed')(inner)

  db.open(directory, t.end.bind(t))
})

test('put & then get', function (t) {
  db.put('beep', 'boop', function (err) {
    t.error(err)

    db.get('beep', function (err, value) {
      t.error(err)
      t.equal(value.toString(), 'boop')
      t.end()
    })
  })
})

test('get none existing', function (t) {
  db.get('does not exists', function (err, value) {
    t.error(err)
    t.notOk(value)
    t.end()
  })
})

test('snapshot', function (t) {
  var snapshot = db.createSnapshot()

  db.remove('beep', function (err) {
    t.error(err)
    db.get('beep', snapshot, function (err, value) {
      t.error(err)
      t.equal(value.toString(), 'boop')
      t.end()
    })
  })
})

test('batch', function (t) {
  var batch = db.createBatch()

  batch.put('beep', 'boop')
  batch.put('hello', 'world')
  batch.remove('beep')

  db.write(batch, function (err) {
    t.error(err)

    db.get('beep', function (err, value) {
      t.error(err)
      t.notOk(value)
      db.get('hello', function (err, value) {
        t.error(err)
        t.equal(value.toString(), 'world')
        t.end()
      })
    })
  })
})
