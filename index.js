//Import required libs
var timers = require('countdown-timer-js');
var moment = require('moment');
const axios = require('axios');

//Global variables
let timer = null;
let loginUrl = 'https://m2web.talk2m.com/t2mapi/login?';

let initializeApplication = () => {
  console.log('Setting initial time span to five minutes.');
  timer = new CountDownTimer("00:00:00");
  updateTime(0, 0, 5);
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
let failedLogins = 0;

let timerSetup = () => {
  timer.subscribe((times, parameters) => {
    console.log('Timer: ', times);
    if(timer.isFinal()){
      var x = talk2mCheck();
      x.then((response) => {
        if(response){
          console.log('Successful M2Web Login At: ', moment().format('MMMM Do YYYY, h:mm:ss a'));
          failedLogins = 0;
          updateTime(0,0,10);
        }
      }).catch((error) => {
        failedLogins++;
        console.log('Failed to login in to M2Web At: ', moment().format('MMMM Do YYYY, h:mm:ss a'));
        console.log('Reducing timer interval to 30 second checks...');
        if(failedLogins === 5){
          //TODO: Send a notification to admins advising to a failed server login for 5 consecutive attempts.
        }
        updateTime(0,0,15);
        timer.start();
      })
    }
  });
}

let devId = "";
let account = "";
let user = "";
let pass = "";
var talk2mCheck = () => {
  return new Promise((resolve, reject) => {
  axios.get(loginUrl + 't2mdeveloperid=' + devId + '&t2maccount=' + account + '&t2musername=' + user + '&t2mpassword=' + pass)
  .then(response => {
    resolve(response.data.success);
  })
  .catch(error => {
    console.log('Rejecting with falst');
    reject(false);
  });
});
}

initializeApplication();
