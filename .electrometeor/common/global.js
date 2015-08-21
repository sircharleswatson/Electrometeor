var Common = require('./common.js');

for (var cmd in Common) {
  global[cmd] = Common[cmd];
}
