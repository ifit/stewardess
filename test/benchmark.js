"use strict";

var stewardess = require('../index')
  , assert = require('assert')
  ;

describe('benchmark stewardess', function() {
  it('perfomance baseline', baselinePerformance);
  it('simple performance test', performanceTest);
});

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
