"use strict";

function defaults(obj, defaults) {
  obj = obj || {};
  var tmp = Object.create(defaults);
  Object.keys(obj).forEach(function(key) {
    tmp[key] = obj[key]
  });
  return tmp;
}

module.exports = defaults;
