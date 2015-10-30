var types = {
  FIREBASE: 'firebase',
  SOCKET: 'socket'
};

var SignallingFactory = {
  make: function(type, room) {
    var signallingServers = {};
    signallingServers[types.FIREBASE] = require('./sigFirebase');
    signallingServers[types.SOCKET] = require('./socket');

    var server = signallingServers[type];
    return new server(room);
  }
};


module.exports = {
  factory: SignallingFactory,
  types: types
};
