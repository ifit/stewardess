"use strict";

var http = require('http')
  , stewardess = require('../index')

var handle = stewardess(
  function logRequest(req, res, next) {
    console.log(req.url + ' requested');
    next();
  },
  function wait(req, res, next) {
    setTimeout(next, 100)
  },
  function checkForCurl(req, res, next) {
    if (req.headers && /^curl/.test(req.headers['user-agent'])) {
      res.end('yur usin curl!');
      next('break'); // fire 'done' and stop
    } else {
      next();
    }
  },
  function respond(req, res, next) {
    res.end('oh hai');
    next();
  }
)
.plugin(stewardess.plugins.hrTimer)
.plugin(stewardess.plugins.overallTime, {
  message: "request served in %sms"
})
.done(function(req, res) {
  console.log(req.url + ' served with status ' + res.statusCode);
  console.log();
})
.bind();

http.Server(handle).listen(8080);
