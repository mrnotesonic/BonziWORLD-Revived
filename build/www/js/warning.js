function hidewarning() {
  var x = document.getElementById("page_warning");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}
function showunder12warning() {
  $('#page_contentwarning').show('slow');
  msg = new SpeechSynthesisUtterance();
  synth = window.speechSynthesis;
  voices = window.speechSynthesis.getVoices();
  msg.text = "Content Warning! User made content in this website may not be suitible for users under the age of 12, or people who have parents who can't handle swearing. Continue Anyway?"
  synth.speak(this.msg); 
}
function hideunder12warning() {
  $('#page_contentwarning').hide('slow');
  synth.cancel();
  msg = new SpeechSynthesisUtterance();
  synth = window.speechSynthesis;
  voices = window.speechSynthesis.getVoices();
  msg.text = "Don't say i didn't warn you!"
  synth.speak(this.msg); 
}
function hidemute() {
  var x = document.getElementById("page_mute");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}
function hideadmin() {
  var x = document.getElementById("page_achieve");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}

