//Import required libs
var timers = require('countdown-timer-js');
var moment = require('moment');

//Global variables
let timer = null;

let initializeApplication = () => {
  console.log('Setting initial time span to five minutes.');
  timer = new CountDownTimer("00:00:00");
  updateTime(0, 5, 0);
  timerSetup();
}

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
let timerSetup = () => {
  timer.subscribe((times, parameters) => {
    console.log(times);
  });
}

initializeApplication();
