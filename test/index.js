"use strict";

var stewardess = require('../index')
  , assert = require('assert')
  ;

describe('testing stewardess', function() {
  describe('the basics', function() {
    it('should run serially', basicTest);
    it('should add methods with .add()', testAdd);
    it('should add methods with .addBefore()', testAddBefore);
    it('should pass arguments from run the each method', passArgs);
    it('should set context', testContext);
    it('should set context and args', testContextAndArgs);
  });

  describe('bind and repeat', function() {
    it('should return a repeatable function with bind()', repeatWithBind);
    it('should operate two calls concurrently', concurrentBind);
  });

  describe('events', function() {
    it('should execute before, after, and done events', testEvents);
    it('should send function name to before and after events', testFunctionNameEvents);
    it('should execute final event after done', finalAfterDone);
    it('should execute final event after error', finalAfterError);
  });

  describe('error handling', function() {
    it('should receive callback errors and not continue', callbackErrors);
    it('should catch errors and not continue', catchErrors);
    it('should send arguments to error handler', errorArgs);
    it('should send context to errors', testErrorContext);
  });

  describe('break, skip, previous, repeat', function() {
    it('should break and fire done event and not continue', testBreak);
    it('should skip a method if err is "skip"', skipMethod);
    it('should skip last method and emit done', skipLastMethod);
    it('should go back to the previous method', previousMethod);
    it('should repeat the previous method', previousMethodRepeat);
    it('should repeat the first method if it calls previous', firstPrevious);
    it('should repeat a method if it calls repeat', repeatMethod);
    it('should allow next, previous, skip pattern', nextPreviousSkip);
  });

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

function callbackErrors(done) {

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
    done();
  })
  .run();

}

function catchErrors(done) {

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
    done();
  })
  .run();

}

function testEvents(done) {

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
    done();
  })
  .run();


}

function testBreak(done) {
  var first, second, after;
  stewardess(
    function(next) {
      first = true;
      next('break');
    },
    function(next) {
      second = true;
    }
  )
  .after(function() {
    after = true;
  })
  .done(function() {
    assert.ok(first);
    assert.ok(after);
    assert.ok(!second);
    done();
  })
  .run();
}

function testFunctionNameEvents(done) {
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
  .done(function() {
    done();
  })
  .run(obj);

}

function passArgs(done) {

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
  .done(function() {
    done();
  })
  .run('meow', {meow: 'mix'});

}

function errorArgs(done) {

  stewardess(function() {
    throw 'oh noes';
  })
  .error(function(err, meow) {
    assert.equal(meow, 'meow');
    done();
  })
  .run('meow');

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

function testContext(done) {
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
  .done(function() {
    done();
  })
  .context(context)
  .run();


}

function testContextAndArgs(done) {
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
  .done(function() {
    done();
  })
  .context(context)
  .run('meow', 'mix');


}

function testErrorContext(done) {
  var context = 'oh hay their';

  stewardess(function() {
    throw 'meow';
  })
  .error(function() {
    assert.equal(this, context);
    done();
  })
  .context(context)
  .run();
}

function finalAfterDone(done) {
  var doneDone = false;

  stewardess(function(next) {
    next();
  })
  .done(function() {
    doneDone = true;
  })
  .final(function() {
    assert.ok(doneDone);
    done();
  })
  .run();
}

function finalAfterError(done) {
  var errorDone = false;

  stewardess(function() {
    throw 'meow';
  })
  .error(function() {
    errorDone = true;
  })
  .final(function() {
    assert.ok(errorDone);
    done();
  })
  .run();
}

function skipMethod(done) {
  var n = 0;

  stewardess(
    function(next) {
      n += 1;
      next('skip');
    },
    function (next) {
      throw new Error('should never run');
    },
    function (next) {
      n += 1;
      next();
    }
  )
  .done(function() {
    assert.equal(n, 2);
    done();
  })
  .run();
}

function skipLastMethod(done) {
  var n = 0;

  stewardess(
    function(next) {
      n += 1;
      next('skip');
    },
    function (next) {
      throw new Error('should never run');
    }
  )
  .done(function() {
    assert.equal(n, 1);
    done();
  })
  .run();
}

function previousMethod(done) {
  var secondDone = false;

  stewardess(
    function(next) {
      if (secondDone) {
        done();
      } else {
        next();
      }
    },

    function(next) {
      secondDone = true;
      next('previous');
    }
  )
  .run()
}

function previousMethodRepeat(done) {
  var firstCount = 0;
  var secondDone = false;

  stewardess(
    function(next) {
      ++firstCount;
      if (secondDone) {
        done();
      } else {
        next();
      }
    },

    function(next) {
      if (!secondDone) {
        secondDone = true;
        return next('previous');
      }
      next();
    },

    function(next) {
      assert.equal(firstCount, 2);
      next();
    }
  )
  .done(function() {
    done();
  })
  .run()
}

function firstPrevious(done) {
  var count = 0;

  stewardess(
    function(next) {
      if (count < 5) {
        count += 1;
        return next('previous');
      }
      next();
    }
  )
  .done(function() {
    assert.equal(count, 5);
    done();
  })
  .run();
}

function repeatMethod(done) {
  var n = 0;

  stewardess(
    function repeater(next) {
      n += 1;
      if (n < 5) return next('repeat');
      next();
    },

    function verify(next) {
      assert.equal(n, 5);
      next();
    }
  )
  .done(function() {
    done();
  })
  .run();
}

function nextPreviousSkip(done) {
  var cache = null;

  stewardess(
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
  .done(function() {
    done();
  })
  .run();
}
