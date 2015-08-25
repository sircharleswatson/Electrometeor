/* global em*/
require('shelljs/global');
require('colors');
require('./common/global');

var AdmZip = require('adm-zip');


/*******************************************************************************
  ELECTROMETEOR
*******************************************************************************/

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
  downloadMongoDB();
  downloadNode();

  // make sure we exit the cache directory when we're done downloading
  cd(em.appBase);
}


/*******************************************************************************
  ELECTRON
*******************************************************************************/

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

  var electronFileName = 'electron-v' + em.electronVersion + '-' + platform;

  if (bitType === "32") {
    electronFileName += '-ia32.zip';
  } else {
    electronFileName += '-x64.zip';
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

  if (em.onWindows) {

    var electronZip = new AdmZip(filename);
    electronZip.extractAllTo('electron', true);

  } else {

    mkdir('electron');
    exec('unzip -d electron ' + filename);

  }
}


/*******************************************************************************
  MONGODB
*******************************************************************************/

function downloadMongoDB() {

  // Setup
  echo('\n');
  var downloading = '-----> Downloading MongoDB... (version: '
                  + em.mongoVersion
                  + ')';

  echo(downloading.magenta);

  var platform = em.sysPlatform === "darwin" ? "osx" : em.sysPlatform;
  var mongoFileName = getMongoFileName(platform, em.bitType);


  // Execute
  curlMongoFile(mongoFileName, platform);
  extractMongoFile(mongoFileName);

}

function getMongoFileName(platform, bitType) {

  var mongoFileName = 'mongodb-' + platform;

  if (em.onWindows) {
    if (bitType === '32') {
      mongoFileName += '-i386-' + em.mongoVersion + '.zip';
    } else {
      mongoFileName += '-x86_64-2008plus-' + em.mongoVersion + '.zip';
    }
  }

  if (!em.onWindows) {
    if (bitType === '32') {
      mongoFileName += '-i686-' + em.mongoVersion + '.tgz';
    } else {
      mongoFileName += '-x86_64-' + em.mongoVersion + '.tgz';
    }
  }

  return mongoFileName;
}

function curlMongoFile(filename, platform) {

  var mongoCurl = 'curl -L -o '
                + filename
                + ' https://fastdl.mongodb.org/'
                + platform + '/'
                + filename;

  exec(mongoCurl);
}

function extractMongoFile(filename) {

  var mongoDir = getNameWithoutExtension(filename);
  var mongod = em.sysPlatform === 'win32' ? 'mongod.exe' : 'mongod';

  if (em.onWindows) {

    var mongoZip = new AdmZip(filename);
    mongoZip.extractAllTo('./', true);

  } else {

    exec('tar -zxvf ' + filename);

  }

  cp(mongoDir + '/bin/' + mongod, em.appBase + '/resources/');
  cp(mongoDir + '/GNU-AGPL-3.0', em.appBase + '/resources/MONGOD_LICENSE.txt');

}


/*******************************************************************************
  NODE
*******************************************************************************/

function downloadNode() {

  // Setup
  echo('\n');
  var downloading = '-----> Downloading Node... (version: '
                  + em.nodeVersion
                  + ')';

  echo(downloading.magenta);

  var nodeFileName = getNodeFileName(em.sysPlatform, em.bitType);

  // Only used on Windows
  var npmFileName = 'npm-' + em.npmVersion + '.zip';


  // Execute
  curlNodeFile(nodeFileName);
  extractNodeFile(nodeFileName);

  if (em.onWindows) {
    // Windows needs to download NPM because it's not included with Node.
    curlNpmFile(npmFileName);
    extractNpmFile(npmFileName);

  }

}

function getNodeFileName(platform, bitType) {

  var nodeFileName = 'node-v' + em.nodeVersion + '-' + platform;

  if (em.onWindows) {

    return 'node.exe';

  } else {

    if (bitType === '32') {

      nodeFileName += '-x86.tar.gz';

    } else {

      nodeFileName += '-x64.tar.gz';

    }

  }

  return nodeFileName;

}

function curlNodeFile(filename) {

  var nodeCurl = 'curl -L -o '
               + filename
               + ' http://nodejs.org/dist/'
               + 'v' + em.nodeVersion
               + '/' + filename;

  exec(nodeCurl);
}

function curlNpmFile(filename) {

  echo('\n');
  var downloading = '-----> Downloading NPM... (version: '
                  + em.npmVersion
                  + ')';

  echo(downloading.magenta);

  var npmCurl = 'curl -L -o '
               + filename
               + ' https://github.com/npm/npm/archive/'
               + 'v' + em.npmVersion
               + '.zip';

  exec(npmCurl);

}

function extractNodeFile(filename) {

  if (em.onWindows) {

    mkdir('nodejs');
    cp('node.exe', em.appBase + '/resources/node.exe');
    cp('node.exe', './nodejs/node.exe');

  } else {

    mkdir('node');
    exec('tar -xzf ' + filename + ' --strip-components 1 -C node');
    cp('node/bin/node', em.appBase + '/resources/node');
    cp('node/LICENSE', em.appBase + '/resources/NODE_LICENSE.txt');

  }

}

function extractNpmFile(filename) {

  var npmZip = new AdmZip(filename);
  npmZip.extractAllTo('./nodejs/node_modules/', true);
  mv('./nodejs/node_modules/npm-' + em.npmVersion, './nodejs/node_modules/npm');
  cp('./nodejs/node_modules/npm/bin/npm', './nodejs');
  cp('./nodejs/node_modules/npm/bin/npm.cmd', './nodejs');

}


/*******************************************************************************
  OTHER FUNCTIONS
*******************************************************************************/

function getNameWithoutExtension(fileName) {

  var charsToSlice = 0;

  if (fileName.indexOf('.tar.gz') !== -1) {
    charsToSlice = 7;
  } else {
    // .tgz, .zip
    charsToSlice = 4;
  }

  return fileName.slice(0, -(charsToSlice));

}



