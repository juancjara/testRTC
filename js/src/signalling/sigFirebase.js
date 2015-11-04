var Firebase = require('firebase');

var actions = {
  USER_JOIN: 'user join',
  SEND_SDP: 'send sdp',
  ICE_CANDIDATE: 'ice candidate'
};

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
    this.ref = new Firebase('https://fiery-heat-8434.firebaseio.com/' +
                            this.room);

    this.ref.on('child_added', function(snapshot) {
      var data = snapshot.val();
      data.payload = JSON.parse(data.payload);

      if (data.who === this.who) return;
      snapshot.ref().remove();

      if (data.action === 'should init') {
        console.log('should init');
        this.push(action.USER_JOIN);
      } else if (data.action === actions.USER_JOIN) {
        this.onUserJoin();
      } else if (data.action === actions.SEND_SDP) {
        this.onReceiveSessionDesc(data.payload);
      } else if (data.action === actions.ICE_CANDIDATE) {
        this.onReceiveICECandidate(data.payload);
      }

    }.bind(this));
  },

  sendICECandidate: function(candidate) {
    this.push(actions.ICE_CANDIDATE, candidate);
  },

  userJoin: function() {
    this.push(actions.USER_JOIN);
  },

  send: function(sdp) {
    this.push(actions.SEND_SDP, sdp);
  }
};

module.exports = SigFirebase;

