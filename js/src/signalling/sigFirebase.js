var Firebase = require('firebase');

var SigFirebase = function(room) {
  this.room = room;
  this.who = Date.now();
};

SigFirebase.prototype = {
  push: function(action, payload) {
    payload = payload || {};
    this.ref.push({
      action: action,
      payload: JSON.stringify(payload),
      who: this.who
    });
  },

  connect: function() {
    var server = new Firebase('https://fiery-heat-8434.firebaseio.com/' +
                              this.room);
    this.ref = server;

    this.ref.on('child_added', function(snapshot) {
      var data = snapshot.val();
      data.payload = JSON.parse(data.payload);

      if (data.who === this.who) return;
      snapshot.ref().remove();

      if (data.action === 'user join') {
        this.onUserJoin();
      } else if (data.action === 'send sdp') {
        this.onReceiveSessionDesc(data.payload);
      } else if (data.action === 'ice candidate') {
        this.onReceiveICECandidate(data.payload);
      }

    }.bind(this));
  },

  sendICECandidate: function(candidate) {
    this.push('ice candidate', candidate);
  },

  userJoin: function() {
    this.push('user join');
  },

  send: function(sdp) {
    this.push('send sdp', sdp);
  }
};

module.exports = SigFirebase;

