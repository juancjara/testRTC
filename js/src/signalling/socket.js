var Socket = function(room) {
  this.room = room;
  this.socket = io.connect();

  this.socket.on('full', function(room) {
    trace('Room ' + room + ' is full');
    this.onRoomFull(room);
  }.bind(this));

  this.socket.on('empty', function(room) {
    this.isInitiator = true;
    trace('Room ' + room + ' is empty');
  });

  this.socket.on('join', function(room) {
    trace('Making request to join room ' + room);
  });

  this.socket.on('joined', function(room, numClients) {
    trace('New user has joined ' + room);
    trace('Room has ' + numClients + ' clients');
    //ask host to initiate sdp transfer
    this.onUserJoin();
  }.bind(this));

  this.socket.on('sdp received', function(sdp) {
    trace('Received SDP ');
    trace(sdp);
    this.onReceiveSessionDesc(sdp);
  }.bind(this));

  this.socket.on('ice candidate received', function(candidate) {
    trace('Received ICE candidate ');
    trace(candidate);
    this.onReceiveICECandidate(candidate);
  }.bind(this));

  this.socket.on('log', function (array) {
    console.log.apply(console, array);
  });
};

Socket.prototype = {
  connect: function() {
    if (this.room !== '') {
      trace('Joining room ' + this.room);
      this.socket.emit('create or join', this.room);
    }
  },

  close: function() {
    trace('Disconnecting')
    this.socket.disconnect();
  },

  send: function(sdp) {
    trace('sending sdp')
    this.socket.emit('sdp', {
      room: this.room,
      sdp: sdp
    });
  },

  sendICECandidate: function(candidate) {
    trace('sending ice candidate');
    this.socket.emit('ice candidate', {
      room: this.room,
      candidate: candidate
    });
  }

};

module.exports = Socket;
