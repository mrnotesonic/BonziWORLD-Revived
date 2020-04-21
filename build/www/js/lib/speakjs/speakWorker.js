importScripts('/js/lib/speakjs/tts.js');

onmessage = function(event) {
  postMessage(generateSpeech(event.data.text, event.data.args));
};

