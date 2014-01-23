"use strict";
var stewardess = require('../index')
  ;

stewardess(
  function a(options, next) {
    return next();
  },
  function b(options, next) {
    return next();
  },
  function c(options, next) {
    return next();
  },
  function d(options, next) {
    return next();
  }
)
.error(function(err) {
  throw err;
})
.done(function() {
  console.log('done');
})
.plugin(stewardess.plugins.timer)
.run({});
