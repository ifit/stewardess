"use strict";

var stewardess = require('./index')
  , assert = require('assert')
  ;

describe('testing stewardess', function() {
  it('should run serially', basicTest);
  it('should add methods with .add()', testAdd);
  it('should add methods with .addBefore()', testAddBefore);
  it('should receive callback errors and not continue', callbackErrors);
  it('should catch errors and not continue', catchErrors);
  it('should execute before, after, and done events', testEvents);
  it('should send function name to before and after events', testFunctionNameEvents);
  it('should pass arguments from run the each method', passArgs);
  it('should send arguments to error handler', errorArgs);
  it('should return a repeatable function with bind()', repeatWithBind);
  it('should operate two calls concurrently', concurrentBind);
  it('should set context', testContext);
  it('should set context and args', testContextAndArgs);
  it('should send context to errors', testErrorContext);
  it('perfomance baseline', baselinePerformance);
  it('simple performance test', performanceTest);
});

function basicTest(done) {
  var i = 0

  stewardess(
    function(next) {
      ++i;
      assert.equal(i, 1);
      next();
    },
    function(next) {
      ++i;
      assert.equal(i, 2);
      next();
    },
    function(next) {
      ++i;
      assert.equal(i, 3);
      next();
    }
  )
  .done(function() {
    assert.equal(i, 3);
    done();
  })
  .run();


}

function testAdd(done) {
  var i = 0;
  stewardess()
    .add(function(next) {
      ++i;
      assert.equal(i, 1);
      next();
    })
    .add(function(next) {
      ++i;
      assert.equal(i, 2);
      next();
    })
    .add(function(next) {
      ++i;
      assert.equal(i, 3);
      next();
    })
    .done(function() {
      assert.equal(i, 3);
      done();
    })
    .run();


}

function testAddBefore(done) {
  var i = 0;
  stewardess()
    .add(function(next) {
      ++i;
      assert.equal(i, 2);
      next();
    })
    .add(function(next) {
      ++i;
      assert.equal(i, 3);
      next();
    })
    .addBefore(function(next) {
      ++i;
      assert.equal(i, 1);
      next();
    })
    .done(function() {
      assert.equal(i, 3);
      done();
    })
    .run();


}

function callbackErrors() {

  stewardess(
    function(done) {
      done(new Error('oh noes'));
    },
    function(done) {
      done(new Error('should never run'));
    }
  )
  .error(function(err) {
    assert.equal(err.message, 'oh noes');
  })
  .run();

}

function catchErrors() {

  stewardess(
    function() {
      throw new Error('oh noes');
    },
    function() {
      throw new Error('should never run');
    }
  )
  .error(function(err) {
    assert.equal(err.message, 'oh noes');
  })
  .run();

}

function testEvents() {

  var meow = 'mix'
    , calls = 0;

  stewardess(
    function(next) {
      assert.equal(meow, 'max');
      next();
    }
  )
  .before(function() {
    ++calls;
    assert.equal(meow, 'mix');
    meow = 'max';
  })
  .after(function() {
    ++calls;
    meow = 'mux'
  })
  .done(function() {
    ++calls;
    assert.equal(meow, 'mux')
  })
  .error(function(err) {
    throw err;
  })
  .done(function() {
    assert.equal(calls, 3);
  })
  .run();


}

function testFunctionNameEvents() {
  var obj = {};
  var first = true;

  stewardess(
    function foo(_obj, next) {
      next();
    },
    function(_obj, next) {
      next();
    }
  )
  .before(function(_obj, name) {
  })
  .after(function(_obj, name) {
    assert.equal(obj, _obj);
    if (first) {
      assert.equal(name, 'foo');
      first = false;
    } else {
      assert.equal(name, 'anonymous');
    }
  })
  .run(obj);

}

function passArgs() {

  stewardess(
    function(meow, mix, next) {
      assert.equal(meow, 'meow');
      assert.equal(mix.meow, 'mix');
      mix.meow = mix.meow.toUpperCase();
      next();
    },
    function(meow, mix, next) {
      assert.equal(meow, 'meow');
      assert.equal(mix.meow, 'MIX');
      next();
    }
  )
  .run('meow', {meow: 'mix'});

}

function errorArgs() {

  stewardess(function() {
    throw 'oh noes';
  }).error(function(err, meow) {
    assert.equal(meow, 'meow');
  }).run('meow');

}

function repeatWithBind(done) {
  var foo = {}
    , bar = {}
    , count = 0

  var fns = stewardess(
    function(obj, next) {
      obj.a = 'a';
      next();
    },
    function(obj, next) {
      obj.b = 'b';
      next();
    },
    function(obj, next) {
      obj.c = 'c';
      next();
    }
  )
  .done(runAsserts)
  .bind();

  fns(foo);
  fns(bar);

  function runAsserts() {
    count++;
    if (count !== 2) return;

    assert.deepEqual(foo, {
      a: 'a',
      b: 'b',
      c: 'c'
    });

    assert.deepEqual(bar, {
      a: 'a',
      b: 'b',
      c: 'c'
    });

    done();
  }

}

function concurrentBind(done) {
  var i = 0

  function increment(id, cb) {
    ++i;
    cb();
  }

  var go = stewardess(
    increment,
    function(id, cb) {
      setTimeout(increment.bind(null, id, cb), 10);
    },
    increment
  )
  .done(function(id) {
    if (id === 'b') {
      assert.ok(i === 6 || i === 3);
      done();
    }
  })
  .bind()

  go('a');
  go('b');

}

function testContext() {
  var context = 'meow to the mix';

  function checkContext(cb) {
    assert.equal(this, context);
    if (cb && cb.call) cb();
  }

  stewardess(checkContext)
  .before(checkContext)
  .after(checkContext)
  .done(checkContext)
  .done(function() {
    context = 7;
  })
  .done(function() {
    assert.equal(context, 7);
  })
  .context(context)
  .run();


}

function testContextAndArgs() {
  var context = 'some things are contextual';

  function checkContextAndArgs(meow, mix, cb) {
    assert.equal(meow, 'meow');
    assert.equal(mix, 'mix');
    assert.equal(this, context);
    if (cb && cb.call) cb();
  }

  stewardess(checkContextAndArgs)
  .before(checkContextAndArgs)
  .after(checkContextAndArgs)
  .done(checkContextAndArgs)
  .done(function() {
    context = 'rawr';
  })
  .done(function() {
    assert.equal(context, 'rawr');
  })
  .context(context)
  .run('meow', 'mix');


}

function testErrorContext() {
  var context = 'oh hay their';

  stewardess(function() {
    throw 'meow';
  })
  .error(function() {
    assert.equal(this, context);
  })
  .context(context)
  .run();
}

function baselinePerformance() {
  function incr(i, cb) {
    ++i;
    cb();
  }

  for (var i = 0; i < 10000; ++i) {
    incr(i, function(){});
    incr(i, function(){});
    incr(i, function(){});
    incr(i, function(){});
    incr(i, function(){});
  }

}

function performanceTest() {
  function incr(i, cb) {
    ++i;
    cb();
  }

  var go = stewardess(incr, incr, incr, incr, incr).bind();
  for (var i = 0; i < 10000; ++i) {
    go(i);
  }

}
