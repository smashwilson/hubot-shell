"use strict";

var Capture = module.exports = function (robot) {
  this.robot = robot;
  this.captured = [];
  this.completeCallback = function () {};
};

Capture.prototype.onComplete = function (callback) {
  this.completeCallback = callback;
};

Capture.prototype.patchedRobot = function (id) {
  var self = this;
  var patchedAdapter = Object.create(this.robot.adapter);

  this.captured[id] = [];

  patchedAdapter.send = function () {
    var strings = Array.prototype.slice.call(arguments, 1);
    strings.forEach(function (arg) {
      self._capture(id, arg);
    });
  };

  var patchedRobot = Object.create(this.robot);
  patchedRobot.adapter = patchedAdapter;

  return patchedRobot;
};

Capture.prototype._capture = function (id, msg) {
  this.captured[id].push(msg);
  this._checkCompletion();
};

Capture.prototype._isComplete = function () {
  return ! this.captured.some(function (each) {
    return each.length === 0;
  }.bind(this));
}

Capture.prototype._checkCompletion = function () {
  while (this._isComplete()) {
    var result = [];

    this.captured.forEach(function (each, i) {
      result[i] = each.shift();
    }.bind(this));

    this.completeCallback(result);
  }
};
