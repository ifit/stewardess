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
.final(function() {
  // this is called after done or error is called
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
    } else {
      next();
    }
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

### Call `next('skip')` to skip a method

```javascript
stewardess(
  function(options, next) {
    options.meow = 'mix';
    next('skip');
  },
  function(options, next) {
    throw new Error('should never run');
  }, 
  function(options, next) {
    console.log(options.meow);
  }
)
.run({});
```

### Call `next('repeat')` to repeat a step

```javascript
stewardess(function(next) {
    // this will repeat infinitely
    next('repeat');
}).run();
```

### Call `next('break')` to skip to the end

```javascript
stewardess(
  function(options, next) {
    options.meow = 'mix';
    next('break');
  },
  function(options, next) {
    throw new Error("should never run");
  }
)
.done(function(options) {
  assert.equal(options.meow, 'mix');
})
.run({});
```

### Call `next('previous')` to go back one method

This allows for a pattern of checking and filling a cache.

```javascript
var cache = null;

var checkCache = stewardess(
  function checkCache(next) {
    if (cache) {
      return next('skip');
    }
    next();
  },

  function setCache(next) {
    cache = 8;
    next('previous');
  },

  function useCache(next) {
    assert.equal(cache, 8);
    next();
  }
)
.bind();
```

### Call `next('beginning')` to go back to restart the chain

```javascript
var cats = [ 'Gary' ];
stewardess(
  function first(options, next) {
    options.cats.indexOf('Gebbeth') == -1 ? options.cats.push('Gebbeth') : options.cats.push('Rorschach');
    return next(options.cats.length > 3 ? 'break' : null); // the `break' here prevents an infinite loop
  },
  function second(options, next) {
    options.cats.push('Crook');
    return next();
  },
  function third(options, next) {
    options.cats.push('Sarah');
    return next('beginning');
  }
)
.done(function(options) {
  process.stdout.write('cats: ');
  console.log(options.cats);
})
.plugin(stewardess.plugins.timer)
.run({cats: cats});
```

## Call `next('ending')` to skip to the very last method in the chain

```javascript
var idex = 0;
stewardess(
  function a(options, next) {
    return next(options.idex > 4 ? 'ending' : null);
  },
  function b(options, next) {
    return next(options.idex > 2 ? 'skip' : null);
  },
  function c(options, next) {
    return next('previous');
  },
  function d(options, next) {
    return next('beginning');
  },
  function e(options, next) {
    return next();
  }
)
.before(function(options) {
  options.idex++;
})
.done(function() {
  console.log('done');
})
.run({idex: idex});
```

### Create plugins to repeat setup

```javascript
function myRillyCoolPlugin(stewardess, pluginOptions) {
  if (pluginOptions.rilly === 'ossum') {
    console.log('yur ossum');
  }

  stewardess
  .before(function(options, name) {
    console.log('entering ' + name);
  })
  .after(function(options, name) {
    console.log('leaving ' + name);
  })
  .done(function(options) {
    console.log('all done!');
  });
}

var pluginOptions = {
  rilly: 'ossum'
}

stewardess(
  function first(options, next) {
    options.foo = 'bar';
  },
  function second(options, next) {
    options.baz = 'bam';
  },
  function third(options, next) {
    options.fish = 'sticks';
  }
)
.plugin(myRillyCoolPlugin, pluginOptions)
.run({});
```

### Stewardess comes with a couple of handy plugins

All of the builtin stewardess plugins require the first argument to be
an object.

```javascript
stewardess(
  function first(options, next) {
    setTimeout(next, 100);
  },
  function second(options, next) {
    for (var i = 0; i < 10000; ++i) {
      Math.pow(i);
    }
    next();
  }
)
.plugin(stewardess.plugins.timer) // print the milliseconds taken for each method
.plugin(stewardess.plugins.hrTimer) // same as timer, but with nanosecond precision
.plugin(stewardess.plugins.overallTime) // print the time for the entire stack to run
.run({});
```

### Mongoose Queries

Stewardess will recognize [mongoose](http://mongoosejs.com/) queries, and run them for you.
You just need to make sure the first parameter is an
object, and call comment to tell stewardess which property to store the
results under.

```javascript
stewardess(

  MongoosePersonModel
    .find()
    .select({ name: 1, age: 1 })
    .sort('age')
    .comment('people'), // this tells stewardess where to put the results

  function printPeople(options, next) {
    options.people.forEach(function(person) {
      console.log(person.name, person.age);
    });
    next();
  }

)
.run({});
```

### Testing

Run `npm test`. Requires mocha.

## License

stewardess is published under an MIT style license.
