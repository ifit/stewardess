"use strict";

var defaults = require('./defaults')

function overallTime(stewardess, options) {
  options = defaults(options, {
    message: 'stewardess took %sms',
    log: console.log.bind(console)
  });

  stewardess
  .addBefore(function(obj) {
    var next = arguments[arguments.length - 1];
    obj._start_time = Date.now();
    next();
  })
  .done(function(obj) {
    var ms = Date.now() - obj._start_time;
    options.log(options.message.replace('%s', ms));
  });
}

module.exports = overallTime;
