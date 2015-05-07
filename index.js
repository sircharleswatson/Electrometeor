var childProcess = require('child_process');
var os = require('os');
var fs = require('fs');
var net = require('net');
var path = require('path');
var exec = childProcess.exec;

/* App Name */
/* -------- */
// Be sure to change this or your data might be stored
// somewhere you don't want it to be.
var appName = 'MyElectrometeorApp';


var app = require('app'); // Module to control application life.
var BrowserWindow = require('browser-window'); // Module to create native browser window.

var dirname = __dirname;

// Before starting a local server, freePort will find an available port by letting
// the OS find it.
function freePort (callback) {
  var server = net.createServer();
  var port = 0;

  server.on('listening', function () {
    port = server.address().port;
    server.close();
  });
  server.on('close', function () {
    callback(null, port);
  });

  server.listen(0, '127.0.0.1');
}


// Write something about Start method
var start = function (callback) {
  if (process.env.NODE_ENV === 'development') {
    callback('http://localhost:3000');
  } else {
    process.stdout.write('Starting production server\n');

    // If file paths don't yet exist, create them
    if (os.platform() === 'darwin') {
      var appPath = path.join(process.env.HOME, 'Library/Application Support/', appName, '/');
      var dataPath = path.join(appPath, 'data');
      var bundlePath = path.join(appPath, 'bundle');

      if (!fs.existsSync(appPath))
        fs.mkdirSync(appPath);

      if (!fs.existsSync(dataPath))
        fs.mkdirSync(dataPath);

      if (!fs.existsSync(bundlePath))
        fs.mkdirSync(bundlePath);
    }

    freePort(function (err, webPort) {
      freePort(function (err, mongoPort) {
        console.log('MongoPort: ', mongoPort);
        console.log('WebPort: ', webPort);

        // Be sure to change the PURPOSE to be the name of your app
        var command = 'kill $(ps aux -e | grep PURPOSE=MY_ELECTROMETEOR_APP | awk \'{print $2\') && rm ' + path.join(dataPath, 'mongod.lock');

        exec(command, function (err, stdout, stderr) {
          // Path to mongod command bundled with app.
          var mongodPath = path.join(dirname, 'resources', 'mongod');

          // Arguments passed to mongod command.
          var mongodArgs = ['--bind_ip', '127.0.0.1', '--dbpath', dataPath, '--port', mongoPort, '--unixSocketPrefix', dataPath];

          // Start the Mongo process.
          var mongoChild = childProcess.spawn(mongodPath, mongodArgs, {
            env: {
              PURPOSE: 'MY_ELECTROMETEOR_APP'
            }
          });

          var started = false;
          mongoChild.stdout.setEncoding('utf8');
          mongoChild.stdout.on('data', function (data) {
            console.log(data);

            if (data.indexOf('waiting for connections on port ' + mongoPort)) {
              if (!started) {
                started = true;
              } else {
                return;
              }

              console.log('Starting node child...');
              var rootURL = 'http://localhost';
              var user_env = process.env;
              user_env.ROOT_URL = rootURL;
              user_env.PORT = webPort;
              user_env.BIND_IP = '127.0.0.1';
              user_env.DB_PATH = dataPath;
              user_env.MONGO_URL = 'mongodb://localhost:' + mongoPort + '/meteor';
              // user_env.METEOR_SETTINGS = fs.readFileSync(path.join(dirname, 'resources', 'settings.json'), 'utf8');
              user_env.DIR = dirname;
              user_env.NODE_ENV = 'production';
              user_env.NODE_PATH = path.join(dirname, 'node_modules');

              var nodePath = path.join(dirname, 'resources', 'node');
              var nodeArgs = path.join(dirname, 'bundle', 'main.js');
              var nodeChild = childProcess.spawn(nodePath, [nodeArgs], {
                env: user_env
              });

              var opened = false;

              // listen for errors
              nodeChild.stderr.setEncoding('utf8');
              nodeChild.stderr.on('data', function (data) {
                console.log("stderr: ", data);
              });

              nodeChild.stdout.setEncoding('utf8');
              nodeChild.stdout.on('data', function (data) {
                console.log(data);

                if (data.indexOf('Meteor app started.' !== -1)) {
                  if (!opened) {
                    opened = true;
                  } else {
                    return;
                  }

                  setTimeout(function () {
                    var fullURL = rootURL + ":" + webPort;
                    callback(fullURL, nodeChild, mongoChild);
                  }, 100);
                }
              });
            }
          })
        });
      });
    });
  }
};

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
mainWindow = null;

// Emitted when the application is activated while there is no opened windows. 
// It usually happens when a user has closed all of application's windows and then
// click on the application's dock icon.
app.on('activate-with-no-open-windows', function () {
  if (mainWindow) {
    mainWindow.show();
  }

  return false;
});

// Emitted when Electron has done all of the initialization.
app.on('ready', function () {
  start(function (url, nodeChild, mongoChild) {
    var cleanup = function () {
      app.quit();
    }
    // Create the browser window.
    var windowOptions = {
      width: 800,
      height: 600,
      resizeable: true,
      frame: true,
    }
    mainWindow = new BrowserWindow(windowOptions);
    mainWindow.focus();
    mainWindow.loadUrl(url);

    process.on('uncaughtException', cleanup);

    // Emitted when all windows have been closed and the application will quit. 
    // Calling event.preventDefault() will prevent the default behaviour, which is 
    // terminating the application.
    app.on('will-quit', function (event) {
      console.log('Cleaning up children.');

      if (nodeChild)
        nodeChild.kill();

      if (mongoChild)
        mongoChild.kill();

      process.exit();
    });
  });
});