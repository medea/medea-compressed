# medea-compressed

A medea-module to save/read the values compressed.

[![NPM](https://nodei.co/npm/medea-compressed.png?downloads&stars)](https://nodei.co/npm/medea-compressed/)

[![NPM](https://nodei.co/npm-dl/medea-compressed.png)](https://nodei.co/npm/medea-compressed/)

## Installation

```
npm install medea-compressed
```

## Example

### Input

```javascript
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
```

### Output

```
input Hej hopp
db.get() Hej hopp
```

## Usage

### medeaCompressed(db)

Wrap an existing medea-instance

### .put(key, value, callback)

__db.put__ will save the value in the database - similarly to hos medea works.

The difference is that the `value` _might_ get compressed. If the compressed size is smaller than the original size it's saved compressed, otherwise it's saved raw.

### .get(key, callback)

__db.get__ will read the value from the database.

If the value is compressed the value will be decompressed before being returned. medeaDown looks for the gzip-header to figure out if the value has been gzipped or not.

### .close, .remove, .createSnapshot, .compact

These methods will forward the the arguments to medea-instance.

## Licence

Copyright (c) 2014 David Björklund

This software is released under the MIT license:

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
