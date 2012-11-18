"use strict";

var stewardess = require('../index')
  , colors = require('colors')
  , assert = require('assert')
  ;

describe('stewardess plugins', function() {
  it('test timer plugin', timerPlugin);
  it('test overall time plugin', overallTimePlugin);
  it('test hr time plugin', hrTimerPlugin);
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

function overallTimePlugin(done) {
  var output = '';
  function log(msg) {
    output += msg;
  }

  stewardess(
    function(options, next) {
      setTimeout(next, 10);
    },
    function(options, next) {
      setTimeout(next, 50);
    }
  )
  .plugin(stewardess.plugins.overallTime, {
    message: 'test completed in %sms',
    log: log
  })
  .done(function() {
    assert.ok(/test completed in \d+ms/.test(output));
    done();
  })
  .run({})
}

function hrTimerPlugin(done) {
  var output = [];
  function log(msg) {
    output.push(msg);
  }

  stewardess(
    function one(options, next) {
      setTimeout(next, 5);
    },
    function two(options, next) {
      next();
    }
  )
  .plugin(stewardess.plugins.hrTimer, {
    log: log
  })
  .done(function() {
    assert.ok(output.every(function(v) {
      return /\w+ took \ds \d+\.\d+ms/
    }));
    done();
  })
  .run({});

}

