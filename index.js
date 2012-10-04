"use strict";

var events = require('events')
  , util   = require('util')
  , EventEmitter = events.EventEmitter

// create a new instance of Stewardess and return it
function stewardess() {
  var queue = ( arguments.length === 1
              ? [arguments[0]]
              : Array.apply(null, arguments));
  var self = new Stewardess(queue);
  return self;
}
module.exports = stewardess;

// class defenition
function Stewardess(queue) {
  EventEmitter.call(this);
  this.queue = queue;
}
util.inherits(Stewardess, EventEmitter);

// run through the queue
Stewardess.prototype.run = function() {
  var queue = this.queue
    , queuePos = 0
    , self = this
    , context = this.context || this
    , args = ( arguments.length === 1
             ? [arguments[0]]
             : Array.apply(null, arguments));

  // prepare argument arrays for different events
  var afterArgs = args.concat()
    , beforeArgs = args.concat()
    , doneArgs = args.concat();

  afterArgs.unshift('after');
  beforeArgs.unshift('before');
  doneArgs.unshift('done');

  // push the callback onto the arguments
  args.push(function(err) {
    if (err) return self._error(err, args);
    self.emit.apply(self, afterArgs);
    next();
  });

  // start
  next();

  function next() {
    // check if we are finished
    if (queuePos < queue.length) {
      self.emit.apply(self, beforeArgs);

      // get next method
      var fn = queue[queuePos++];

      try {
        fn.apply(context, args);
      } catch (e) {
        return self._error(e, args);
      }

    } else {
      self.emit.apply(self, doneArgs);
    }
  }

}

Stewardess.prototype._error = function(err, args) {
  args.unshift('error', err);
  args.pop();
  this.emit.apply(this, args);
}

Stewardess.prototype.context = function(context) {
  this.context = context;
  return this;
}

Stewardess.prototype.bind = function() {
  return this.run.bind(this);
}

Stewardess.prototype.add = function(fn) {
  this.queue.push(fn);
  return this;
}

Stewardess.prototype.addBefore = function(fn) {
  this.queue.unshift(fn);
  return this;
}

Stewardess.prototype.after = function(fn) {
  return this.contextOn('after', fn);
}

Stewardess.prototype.before = function(fn) {
  return this.contextOn('before', fn);
}

Stewardess.prototype.error = function(fn) {
  return this.contextOn('error', fn);
}

Stewardess.prototype.done = function(fn) {
  return this.contextOn('done', fn);
}

Stewardess.prototype.contextOn = function(event, fn) {
  var self = this;
  this.on(event, function() {
    fn.apply(self.context, arguments);
  });
  return self;
}
