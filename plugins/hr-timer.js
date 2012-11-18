"use strict";

var defaults = require('./defaults')

function hrTimer(stewardess, options) {
  options = defaults(options, {
    log: console.log.bind(console)
  });

  stewardess
  .before(function(obj) {
    obj._hr_time = process.hrtime();
  })
  .after(function(obj) {
    var name = arguments[arguments.length - 1];
    var t = process.hrtime(obj._hr_time);
    var msg = name + ' took ' + t[0] + 's ' + t[1]/1000000 + 'ms';
    options.log(msg);
  });
}

module.exports = hrTimer;
