# Stewardess

She keeps track of your serial async methods.

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
    // this function goes first
    next();
  },
  function(next) {
    // this function goes second
    next();
  }
)
.add(function(next) {
  // this function goes third
  next();
})
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
