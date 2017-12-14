//Import required libs
var timers = require('countdown-timer-js');
var fs = require('fs');
var moment = require('moment');
var FormData = require('form-data');
var request = require('request');
const axios = require('axios');

//Global variables
let timer = null;
let loginUrl = 'https://m2web.talk2m.com/t2mapi/login?';

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
let failedLogins = 0;
let lastReachableTime = null;
let failedFlag = false;
var duration = 0;
let timerSetup = () => {
  timer.subscribe((times, parameters) => {
    if(timer.isFinal()){
      talk2mCheck().then((response) => {
        if(response){
          if(failedFlag){
          }
          failedLogins = 0;
          lastReachableTime = moment().format('MMMM Do YYYY, h:mm:ss a');;
          updateTime(0,5,0);
        }
      }).catch((error) => {
        console.log(error);
        failedLogins++;
        if(failedLogins === 5){
        }
        updateTime(0,0,30);
      })
    }
  });
}

var userCredentials = JSON.parse(fs.readFileSync('user.json'));
let devId = userCredentials.developerId;
let account = userCredentials.account;
let user = userCredentials.username;
let pass = userCredentials.password;
var talk2mCheck = () => {
  return new Promise((resolve, reject) => {
  axios.get(loginUrl + 't2mdeveloperid=' + devId + '&t2maccount=' + account + '&t2musername=' + user + '&t2mpassword=' + pass)
  .then(response => {
    resolve(response.data.success);
  })
  .catch(error => {
    reject(false);
  });
});
}

initializeApplication();
