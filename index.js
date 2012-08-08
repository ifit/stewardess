"use strict";

var events = require('events')
  , util   = require('util')
  , EventEmitter = events.EventEmitter

function stewardess() {
  var queue = ( arguments.length === 1
              ? [arguments[0]]
              : Array.apply(null, arguments));
  var self = new Stewardess(queue);
  return self;
}
module.exports = stewardess;

function Stewardess(queue) {
  EventEmitter.call(this);
  this.queue = queue;
}
util.inherits(Stewardess, EventEmitter);

Stewardess.prototype.run = function() {
  var queue = this.queue
    , self = this
    , args = ( arguments.length === 1
             ? [arguments[0]]
             : Array.apply(null, arguments));

  args.push(function(err) {
    if (err) return this.emit('error', err);
    self.emit('after');
    self.emit('next');
  });

  self.on('next', next);
  self.emit('next');

  function next() {
    if (queue.length) {
      self.emit('before');
      var fn = queue.shift();
      try {
        fn.apply(self, args);
      } catch (e) {
        return self.emit('error', e);
      }
    } else {
      self.emit('done');
    }
  }
}

Stewardess.prototype.add = function(fn) {
  this.queue.push(fn);
  return this;
}

Stewardess.prototype.after = function(fn) {
  this.on('after', fn);
  return this;
}

Stewardess.prototype.before = function(fn) {
  this.on('before', fn);
  return this;
}

Stewardess.prototype.error = function(fn) {
  this.on('error', fn);
  return this;
}

Stewardess.prototype.done = function(fn) {
  this.on('done', fn);
  return this;
}
