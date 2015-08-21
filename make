require('shelljs/make');

var electrometeor = require('./.electrometeor/methods');

target.all = function() {
  target.setup();
};

target.setup = function() {
  electrometeor.setup();



  // run npm install again after all the setup is done
  target.npmInstall();
};

target.npmInstall = function() {
  electrometeor.npmInstall();
};

target.test = function() {
  electrometeor.test();
};
