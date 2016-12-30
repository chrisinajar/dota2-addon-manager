// expose methods for managing symlinks and adding new addons and stuff
var extend = require('xtend');
var partial = require('ap').partial;
var fs = require('fs');
var path = require('path');
var assertOk = require('assert-ok');

module.exports = Manager;

// list of methods that all take in a state first param
var api = require('./lib');

function Manager (options, exitOnError) {
  var state = extend({
    exitOnError: exitOnError
  }, options);

  // setup instance
  var instance = {};
  Object.keys(api).forEach(function (fnName) {
    instance[fnName] = partial(api[fnName], state);
  });

  var dirStat;
  var gameStat;
  var contentStat;

  state.dir = path.normalize(state.dir);

  try {
    state.dir = fs.realpathSync(state.dir);
  } catch (e) {
    if (e.code === 'ENOENT') {
      instance.exitWithError('Base directory ' + state.dir + ' does not exist!');
    }
    throw e;
  }
  try {
    dirStat = fs.statSync(state.dir);
    gameStat = fs.statSync(path.join(state.dir, './game'));
    contentStat = fs.statSync(path.join(state.dir, './content'));
  } catch (e) {
    if (e.code === 'ENOENT') {
      instance.exitWithError('base directory is missing "' + e.path.split('\\').pop() + '" and therefore probably isn\'t the dota 2 beta folder');
    }
    console.log(state, e, Object.keys(e));
    throw e;
  }

  assertOk(dirStat.isDirectory(), 'base directory is not a directory');
  assertOk(gameStat.isDirectory(), 'game directory is not a directory');
  assertOk(contentStat.isDirectory(), 'content directory is not a directory');

  return instance;
}
