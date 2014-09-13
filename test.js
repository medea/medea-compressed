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

test('put & then get a small value', function (t) {
  db.put('beep', 'boop', function (err) {
    t.error(err)

    db.get('beep', function (err, value) {
      t.error(err)
      t.equal(value.toString(), 'boop')
      inner.get('beep', function (err, innerValue) {
        t.equal(innerValue.toString(), 'boop', 'should be saved raw')
        t.end()
      })
    })
  })
})

test('put & then get a large value', function (t) {
  var input = require('fs').readFileSync(__filename)

  db.put('large', input, function (err) {
    t.error(err)

    db.get('large', function (err, value) {
      t.error(err)
      t.deepEqual(value, input)
      inner.get('large', function (err, compressed) {
        t.error(err)
        t.ok(compressed.length < input.length, 'should be saved compressed')
        t.end()
      })
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

test('can get raw data also', function (t) {
  inner.put('bing', 'bong', function (err) {
    t.error(err)

    db.get('bing', function (err, value) {
      t.error(err)
      t.equal(value.toString(), 'bong')
      t.end()
    })
  })
})
