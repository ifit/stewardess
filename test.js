"use strict";

var stewardess = require('./index')
  , assert = require('assert')
  ;

(function() {
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
  ).run();

  assert.equal(i, 3);

})();


(function() {
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
    .run();

  assert.equal(i, 3);

})();

(function() {

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

})();

(function() {

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
  .run();

  assert.equal(calls, 3);

})();

(function() {

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

})();

console.log('All assertions passed');
