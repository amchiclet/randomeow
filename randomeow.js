var buffers = [];
var context;
var urls = ['cat1.mp3', 'cat2.mp3', 'cat3.mp3', 'cat4.mp3', 'cat5.mp3', 'cat6.mp3', 'cat7.mp3', 'cat8.mp3'];
var allImages = ['cat1.png', 'cat2.png', 'cat3.png', 'cat5.png', 'cat6.png', 'catborder1.png', 'catborder2.png'];
var borderImages = { 'catborder1.png': true, 'catborder2.png': true };
var soundsLoaded = false;


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
        soundsLoaded = true;
        var btn = document.getElementById('start-btn');
        btn.disabled = false;
        btn.innerHTML = document.getElementById('intensity').value + '<br>Meows!';
      },
      alert);
  }
  request.send();
}

function playSound(which, when) {
  setTimeout(function() {
    var source = context.createBufferSource();
    source.buffer = buffers[which];
    source.connect(context.destination);
    source.start(0);
  }, when * 1000);
}

function playImage(src, when, size) {
  setTimeout(function() {
    var wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.pointerEvents = 'none';
    wrapper.style.zIndex = '0';
    var margin = size;
    wrapper.style.left = margin + Math.random() * (window.innerWidth - size - margin * 2) + 'px';
    wrapper.style.top = margin + Math.random() * (window.innerHeight - size - margin * 2) + 'px';
    var flip = Math.random();
    if (flip < 0.33) wrapper.style.transform = 'scaleX(-1)';
    else if (flip < 0.66) wrapper.style.transform = 'scaleY(-1)';
    var img = document.createElement('img');
    img.src = src;
    img.className = 'cat-img';
    img.style.width = size + 'px';
    img.style.setProperty('--base-rotate', (Math.random() * 120 - 60) + 'deg');
    wrapper.appendChild(img);
    document.body.appendChild(wrapper);
    img.addEventListener('animationend', function() {
      wrapper.remove();
    });
  }, when * 1000);
}

function playBorderImage(src, when, size) {
  setTimeout(function() {
    var wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.pointerEvents = 'none';
    wrapper.style.zIndex = '0';

    var img = document.createElement('img');
    img.src = src;
    img.className = 'cat-border-img';
    img.style.width = size + 'px';

    // Pick a random edge: 0=bottom, 1=top, 2=left, 3=right
    var edge = Math.floor(Math.random() * 4);
    if (edge === 0) {
      // bottom: peek up, upright
      wrapper.style.top = (window.innerHeight - size) + 'px';
      wrapper.style.left = Math.random() * (window.innerWidth - size) + 'px';
      img.style.setProperty('--peek-from', '0 100%');
      img.style.setProperty('--peek-to', '0 20%');
    } else if (edge === 1) {
      // top: peek down, flipped
      wrapper.style.top = '0';
      wrapper.style.left = Math.random() * (window.innerWidth - size) + 'px';
      img.style.rotate = '180deg';
      img.style.setProperty('--peek-from', '0 -100%');
      img.style.setProperty('--peek-to', '0 -20%');
    } else if (edge === 2) {
      // left: peek right, rotated 90
      wrapper.style.left = '0';
      wrapper.style.top = Math.random() * (window.innerHeight - size) + 'px';
      img.style.rotate = '90deg';
      img.style.setProperty('--peek-from', '-100% 0');
      img.style.setProperty('--peek-to', '-20% 0');
    } else {
      // right: peek left, rotated 270
      wrapper.style.left = (window.innerWidth - size) + 'px';
      wrapper.style.top = Math.random() * (window.innerHeight - size) + 'px';
      img.style.rotate = '270deg';
      img.style.setProperty('--peek-from', '100% 0');
      img.style.setProperty('--peek-to', '20% 0');
    }

    if (Math.random() < 0.5) {
      if (edge <= 1) wrapper.style.transform = 'scaleX(-1)';
      else wrapper.style.transform = 'scaleY(-1)';
    }

    wrapper.appendChild(img);
    document.body.appendChild(wrapper);
    img.addEventListener('animationend', function() {
      wrapper.remove();
    });
  }, when * 1000);
}

function randomMeow() {
  if (!soundsLoaded) return;
  context.resume();

  var howOften = document.getElementById('intensity').value;
  var howLong = howOften <= 5 ? 1 : 5;
  // Image size range: mostly normal with occasional giants
  // At intensity 1: 150-200px, at 999: 10-50px
  // ~10% chance of a crazy big one (up to 5x normal max)
  var t = (howOften - 1) / 998;
  var minSize = Math.round(150 - t * 140);
  var maxSize = Math.round(200 - t * 150);
  var crazyMaxSize = maxSize * 5;

  // Build array of times, guaranteeing at least 1 per second
  var times = [];
  var seconds = Math.floor(howLong);
  for (var s = 0; s < seconds && times.length < howOften; s++) {
    times.push(s + Math.random());
  }
  while (times.length < howOften) {
    times.push(Math.random() * howLong);
  }

  for (i = 0; i < howOften; ++i) {
    var whichSound = Math.floor(Math.random() * urls.length);
    var whichImage = Math.floor(Math.random() * allImages.length);
    var imageSrc = allImages[whichImage];
    var when = times[i];
    playSound(whichSound, when);
    var imgSize;
    if (Math.random() < 0.1) {
      imgSize = Math.round(maxSize + Math.random() * (crazyMaxSize - maxSize));
    } else {
      imgSize = Math.round(minSize + Math.random() * (maxSize - minSize));
    }
    if (borderImages[imageSrc]) {
      playBorderImage(imageSrc, when, imgSize);
    } else {
      playImage(imageSrc, when, imgSize);
    }
  }
}

function updateButton(value) {
  var t = (value - 1) / 998;
  var r = Math.round(107 + t * 148);
  var g = Math.round(159 - t * 77);
  var b = Math.round(255 - t * 173);
  var btn = document.getElementById('start-btn');
  var light = 'rgb(' + Math.min(r + 40, 255) + ',' + Math.min(g + 40, 255) + ',' + Math.min(b + 40, 255) + ')';
  var dark = 'rgb(' + r + ',' + g + ',' + b + ')';
  btn.style.background = 'linear-gradient(145deg, ' + light + ', ' + dark + ')';
  if (soundsLoaded) {
    btn.innerHTML = value + '<br>Meows!';
  }

  btn.classList.remove('charge-1', 'charge-2', 'charge-3');
  if (value >= 999) {
    btn.classList.add('charge-3');
  } else if (value >= 500) {
    btn.classList.add('charge-2');
  } else if (value >= 100) {
    btn.classList.add('charge-1');
  }
}

init();
document.getElementById('start-btn').addEventListener('click', randomMeow);
updateButton(document.getElementById('intensity').value);
