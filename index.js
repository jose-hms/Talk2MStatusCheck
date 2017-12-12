//Import required libs
var timers = require('countdown-timer-js');
var moment = require('moment');

//Global variables
let timer = new CountDownTimer(timeInterval);

//Wireframe to manage t2m status checks
timer.subscribe(function(times, parameters) {
});

//Update the time interval.
let updateTime = (hours, minutes, seconds) => {
  if(isNaN(hours)){
    hours = 0;
  }

  if(isNaN(minutes)){
    minutes = 0;
  }

  if(isNaN(seconds)){
    seconds = 0;
  }

  timer.setTimes(hours + ":" + minutes + ":" + seconds);
}
