# Stewardess

She keeps track of your serial async methods.

Also provies a small bag of peanuts and half a can of soda.

### Install

`npm install stewardess`

### Usage:

```javascript
var stewardess = require('stewardess')

function first(next) {
  console.log('first');
  next();
}

function second(next) {
  console.log('second');
  next();
}

function third(next) {
  console.log('third');
  next();
}

stewardess(
  first,
  second,
  third
).run();
```

### stewardess has lot's of chainable methods:

```javascript
stewardess(
  function(next) {
    // this function goes second
    next();
  }
)
.add(function(next) {
  // this function goes third
  next();
})
.addBefore(function(next) {
  // this function goes first
  next();
}),
.before(function() {
  // this is called before each function
})
.after(function() {
  // this is after before each function
})
.done(function() {
  // this is called when all methods finish
})
.error(function(err) {
  // if any method throws an error,
  // or calls next(err), it ends up here
})
.context({'some':'object'}) // set this-ness for all callbacks
.run(); // this starts it
```

### you can also pass arguments into `run()`, which will be sent to each method along the way

```javascript
stewardess(
  function(meow, mix, next) {
    meow === 'meow';
    mix.meow === 'mix';
    mix.meow = mix.meow.toUpperCase();
    next();
  },
  function(meow, mix, next) {
    meow === 'meow';
    mix.meow === 'MIX';
    next();
  }
)
.after(function(meow, mix) {
  // before, after, and done also get arguments
})
.error(function(err, meow, mix) {
  // error gets arguments with the error
})
.run('meow', {meow: 'mix'});
```

### you can reuse a stewardess instance by calling `bind()`

Here is an example of using stewardess to provide middleware for an http
server. It gives the length of each piece of middleware and for the
entire request.

```javascript
"use strict";

var http = require('http')
  , stewardess = require('./index')

var handle = stewardess(
  function(req, res, next) {
    req.startTime = process.hrtime();
    next();
  },
  function(req, res, next) {
    console.log(req.url + ' requested');
    next();
  },
  function(req, res, next) {
    if (req.headers && /^curl/.test(req.headers['user-agent'])) {
      res.end('yur usin curl!');
      next('break'); // fire 'done' and stop
    }
    next();
  },
  function(req, res, next) {
    res.end('oh hai');
    next();
  }
)
.before(function(req, res) {
  req.i = req.i + 1 || 1;
  req.lastStart = process.hrtime();
})
.after(function(req, res) {
  var t = process.hrtime(req.lastStart);
  console.log('middleware ' + req.i + ' took %d seconds and %d ms', t[0], t[1]/1000000);
})
.done(function(req, res) {
  var t = process.hrtime(req.startTime);
  console.log(req.url + ' served in %d seconds and %d ms', t[0], t[1]/1000000);
})
.done(function(req, res) {
  console.log(req.url + ' served with status ' + res.statusCode);
  console.log();
})
.bind();

http.Server(handle).listen(8080);
```
