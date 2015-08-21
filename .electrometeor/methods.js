/* global em*/
require('shelljs/global');
require('colors');
require('./common/global');

var AdmZip = require('adm-zip');

exports.setup = function() {
  config.fatal = true;

  echo('\nSetting up your project for use with Electrometeor'.green);

  printVersions();
  createResourcesDir();
  createCacheDir();
  downloadDependencies();
};

exports.npmInstall = function() {

  cd(em.appBase);

  echo('\nRunning'.yellow, 'npm install'.bgWhite.black, '\n');
  exec('npm install');

  // We always need to run this after every npm install
  echo('\n');
  echo('Rebuilding native Node modules'.yellow);
  exec('./node_modules/.bin/electron-rebuild -v ' + em.electronVersion);

};




// just to test things out. no real use.
exports.test = function() {
  em.test();
};

function printVersions() {

  echo('\n');
  echo('Node Version: ', em.nodeVersion);
  echo("Electron Version: ", em.electronVersion);
  echo("Mongo Version: ", em.mongoVersion);

}

function createResourcesDir() {
  if (test('-d', em.resources)) {
    rm('-rf', em.resources);
  }

  mkdir(em.resources);
}

function createCacheDir() {
  if (test('-d', em.cache)) {
    rm('-rf', em.cache);
  }

  mkdir(em.cache);
}

function downloadDependencies() {
  cd(em.cache);

  downloadElectron();


  // make sure we exit the cache directory when we're done downloading
  cd(em.appBase);
}

function downloadElectron() {

  // Setup
  echo('\n');
  var downloading = '-----> Downloading Electron... (version: ' + em.electronVersion + ')';
  echo(downloading.magenta);


  var electronFileName = getElectronFileName(em.sysPlatform, em.bitType);

  // Execute
  curlElectronFile(electronFileName, em.electronVersion);
  extractElectronFile(electronFileName);

}

function getElectronFileName(platform, bitType) {

  var electronFileName = '';

  if (em.isWindows()) {

    if (bitType === "32") {
      electronFileName = 'electron-v' + em.electronVersion + '-' + platform + '-ia32.zip';
    } else {
      electronFileName = 'electron-v' + em.electronVersion + '-' + platform + '-x64.zip';
    }

  } else {
    if (bitType === "32") {
      electronFileName = 'electron-v' + em.electronVersion + '-' + platform + '-ia32.zip';
    } else {
      electronFileName = 'electron-v' + em.electronVersion + '-' + platform + '-x64.zip';
    }
  }

  return electronFileName;

}

function curlElectronFile(filename, version) {

  var electronCurl = 'curl --insecure -L -o '
                   + filename
                   + ' http://github.com/atom/electron/releases/download/v'
                   + version + '/' + filename;

  exec(electronCurl);
}

function extractElectronFile(filename) {

  if (em.isWindows) {

    var electronZip = new AdmZip(filename);
    electronZip.extractAllTo('electron', true);

  } else {

    mkdir('electron');
    exec('unzip -d electron ' + filename);

  }
}
