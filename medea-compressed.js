var after = require('after')

  , zlib = require('zlib')

  , MedeaCompressed = function (db) {
      if (!(this instanceof MedeaCompressed))
        return new MedeaCompressed(db)

      this.db = db
    }

    // borrowed from https://github.com/mafintosh/gunzip-maybe
  , isGzipped = function (data) {
      if (data.length < 10) return false // gzip header is 10 bytes
      if (data[0] !== 0x1f && data[1] !== 0x8b) return false // gzip magic bytes
      if (data[2] !== 8) return false // is deflating
      return true
    }

  , maybeGunzip = function (data, callback) {
      if (isGzipped(data))
        zlib.gunzip(data, callback)
      else
        callback(null, data)
    }

  , maybeGzip = function (data, callback) {
      zlib.gzip(data, function (err, zipped) {
        if (err) return callback(err)

        callback(null, zipped.length < data.length ? zipped : data)
      })
    }

MedeaCompressed.prototype.get = function (key, snapshot, callback) {
  if (!callback) {
    callback = snapshot
    snapshot = null
  }

  this.db.get(key, snapshot, function (err, data) {
    if (err) return callback(err)

    if (!data) return callback()

    maybeGunzip(data, callback)
  })
}

MedeaCompressed.prototype.put = function (key, value, callback) {
  var self = this

  maybeGzip(value, function (err, zipped) {
    if (err) return callback(err)

    self.db.put(key, zipped, callback)
  })
}

MedeaCompressed.prototype.createBatch = function () {
  var operations = []

  return {
    put: function (key, value) {
      operations.push({ key: key, value: value, type: 'put'})
    },
    remove: function (key) {
      operations.push({ key: key, type: 'remove' })
    },
    operations: operations
  }
}

MedeaCompressed.prototype.write = function (batch, options, callback) {
  if (!callback) {
    callback = options
    options = {}
  }

  var self = this
    , compressedOperations = new Array(batch.operations.length)
    , done = after(batch.operations.length, function (err) {
        if (err) return callback(err)

        var medeaBatch = self.db.createBatch()

        compressedOperations.forEach(function (operation) {
          if (operation.type === 'put') {
            medeaBatch.put(operation.key, operation.value)
          } else {
            medeaBatch.remove(operation.key)
          }
        })

        self.db.write(medeaBatch, options, callback)
      })

  batch.operations.forEach(function (operation, index) {
    if (operation.type === 'remove') {
      compressedOperations[index] = { type: 'remove', key: operation.key }
      done()
    } else {
      maybeGzip(operation.value, function (err, zipped) {
        if (err)
          return done(err)

        compressedOperations[index] = { type: 'put', key: operation.key, value: zipped }
        done()
      })
    }
  })
}

;[ 'remove', 'createSnapshot', 'compact', 'open', 'close' ].forEach(function (methodName) {
  MedeaCompressed.prototype[methodName] = function () {
    return this.db[methodName].apply(this.db, arguments)
  }
})

module.exports = MedeaCompressed
