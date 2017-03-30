var buffers = [];
var context;
var urls = ['cat1.mp3', 'cat2.mp3', 'cat3.mp3', 'cat4.mp3', 'cat5.mp3', 'cat6.mp3', 'cat7.mp3', 'cat8.mp3'];

function init() {
  try {
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    context = new AudioContext();
  }
  catch(e) {
    alert('Web Audio API is not supported in this browser');
  }
  loadSounds();
}

function loadSounds() {
  for (i = 0; i < urls.length; ++i) {
    loadSound(i);
  }
}

function loadSound(index) {
  var url = urls[index];
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
    context.decodeAudioData(
      request.response,
      function (buffer) {
        buffers[index] = buffer;
        for (i = 0; i < urls.length; ++i) {
          if (!(i in buffers)) {
            return;
          }
        }
        var button = document.getElementById('playSoundsButton');
        button.disabled = false;
        button.value = 'Listen';
      },
      alert);
  }
  request.send();
}

function playSound(which, when) {
  var source = context.createBufferSource();
  source.buffer = buffers[which];
  source.connect(context.destination);
  source.start(when);
}

function randomSounds() {
  var startTime = context.currentTime + 1;
  var howLong = document.getElementById('howLong').value;
  var howOften = document.getElementById('howOften').value;
  if (howLong < 1 || howLong > 60) {
    alert('invalid number for step 1');
    return;
  }
  if (howOften < 1 || howOften > 100) {
    alert('invalid number for step 2');
    return;
  }
  for (i = 0; i < howOften; ++i) {
    var which = Math.floor(Math.random() * urls.length);
    var when = Math.random() * howLong;
    playSound(which, startTime + when);
  }
}

window.addEventListener('load', init, false);
