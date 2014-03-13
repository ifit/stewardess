"use strict";
var stewardess = require('../index');

stewardess(
  function first(options, next) {
    return next(options.idex > 10 ? 'skip' : null);
  },
  function second(options, next) {
    options.arr.push(options.idex);
    return next();
  },
  function third(options, next) {
    return next(options.idex > 10 ? null : 'restart');
  }
)
.after(function(options) {
  options.idex++;
})
.done(function(options) {
  process.stdout.write('arr: ');
  console.log(options.arr);
})
.run({arr: [], idex: 0});
