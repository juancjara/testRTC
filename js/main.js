var errorHandler = function(err) {
  trace('error');
  console.log(err);
};

var localVideo = document.getElementById("localVideo");
var remoteVideo = document.getElementById("remoteVideo");

var startButton = document.getElementById("startButton");
var callButton = document.getElementById("callButton");
var hangupButton = document.getElementById("hangupButton");

var localPeerConnection = null;
var servers = null;

var start = function() {
  initCall(true);
};

var join = function() {
  initCall(false);
};

startButton.onclick = start;
callButton.onclick = join;

// WEBRTC STUFF STARTS HERE
// Set objects as most are currently prefixed
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection ||
  window.webkitRTCPeerConnection || window.msRTCPeerConnection;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription || window.msRTCSessionDescription;
navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia ||
  navigator.webkitGetUserMedia || navigator.msGetUserMedia;

var initCall = function(caller) {

  trace('caller initiate ' + caller);

  var gotStream = function(stream) {
    trace('received local stream');
    localVideo.src = URL.createObjectURL(stream);
  };

  var gotRemoteStream = function(event) {
    trace('received remote stream');
    remoteVideo.src = URL.createObjectURL(event.stream);
  };

  localPeerConnection = new RTCPeerConnection(servers);
  getUserMedia({video: true}, function(stream) {

    trace('received local stream');
    localVideo.src = URL.createObjectURL(stream);

    var signalling = new Signalling(caller);
    signalling.connect();

    var gotIceCandidate = function(event) {
      trace('ice candidate');
      if (event.candidate) {
        signalling.sendICECandidate(event.candidate);
      }
    };

    var gotDescription = function(sessionDesc) {
      trace('set local description');
      console.log(sessionDesc);
      localPeerConnection.setLocalDescription(sessionDesc);
      signalling.send(sessionDesc);
    };

    var saveICECandidate = function(candidate) {
      trace('save ice candidate');
      localPeerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    };

    signalling.onUserJoin = function() {
      trace('on user join');
      localPeerConnection.createOffer(gotDescription, errorHandler);
    };

    signalling.onReceiveSessionDesc = function(sessionDesc) {
      trace('receive session desc: ' + (caller? 'caller': 'guest'));
      console.log('remote session', sessionDesc);
      if (caller) {
        trace('set remote with answer');
        localPeerConnection.setRemoteDescription(new RTCSessionDescription(sessionDesc));
      } else {
        localPeerConnection.setRemoteDescription(new RTCSessionDescription(sessionDesc),
          function() {
            trace('make answer');
            localPeerConnection.createAnswer(gotDescription, errorHandler);
          });
      }
      if (!caller) {
        trace('create answer');
      }
    };

    signalling.onReceiveICECandidate = saveICECandidate;
    localPeerConnection.onicecandidate = gotIceCandidate;
    localPeerConnection.onaddstream = gotRemoteStream;

    if (!caller) signalling.userJoin();

  }, errorHandler);

};
