"use strict";
var stewardess = require('../index')
  ;

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
.error(function(err) {
  throw err;
})
.done(function() {
  console.log('done');
})
.plugin(stewardess.plugins.timer)
.run({idex: idex});
