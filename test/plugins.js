"use strict";

var stewardess = require('../index')
  , colors = require('colors')
  , assert = require('assert')
  ;

describe('stewardess timer plugin', function() {
  it('test timer plugin', timerPlugin);
});

function timerPlugin(done) {
  var output = '';
  function log(msg) {
    output += msg;
  }

  stewardess(
    function one(options, next) {
      setTimeout(next, 5);
    },
    function two(options, next) {
      next();
    },
    function three(options, next) {
      setTimeout(next, 25);
    },
    function four(options, next) {
      setTimeout(next, 20);
    }
  )
  .plugin(stewardess.plugins.timer, {
    log: log,
    slow: 10
  })
  .done(function() {
    var expected = /three took \d+msfour took \d+ms/
    var stripped = colors.stripColors(output);
    assert.notEqual(stripped, output);
    assert.ok(expected.test(stripped));
    done();
  })
  .run({});

}
