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
    return next('first');
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
