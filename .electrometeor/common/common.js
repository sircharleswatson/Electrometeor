var path = require('path');

// read versions from emSettings.json
var emSettings = require('../emSettings.json');

var electron = emSettings.electron;
var node = emSettings.node;
var mongo = emSettings.mongo;

var em = {};


// Dependency versions
em.electronVersion = electron.version;
em.nodeVersion = node.version;
em.mongoVersion = mongo.version;


// File paths
em.appBase = path.normalize(path.join(__dirname, '../..'));
em.resources = path.join(em.appBase, 'resources');
em.cache = path.join(em.appBase, 'cache');


// System info
em.sysPlatform = process.platform;
em.sysArch = process.arch;
em.bitType = em.sysArch === "x86" ? "32" : "64";
em.isWindows = function () {

  return em.sysPlatform === "win32" ? true : false;

};


// Functions
em.test = function() {

  console.log('TESTING COMMONG FUNCITONS');
  console.log(em.appBase);
  echo(em.sysPlatform);
  echo(em.sysArch);

};


exports.em = em;
