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

var hmsHowPmUrl = 'https://forum.hms-networks.com/posts';
let sendAlert = (message) => {
  var formData = {
  'api_key': userCredentials.discourse.api_key,
  'api_username': userCredentials.discourse.api_username,
  'title': 'Talk2M Monitor Notification',
  'raw': message,
  'target_usernames': 'jordan_hms',
  'archetype': 'private_message'
}

  const config = { headers: { 'Content-Type': 'multipart/form-data' } };

  request.post({
    url: 'https://forum.hms-networks.com/posts',
    form: formData
  }, function optionalCallback(err, httpResponse, body) {
  if (err) {
    return console.error('upload failed:', err);
  }
  console.log('Upload successful!  Server responded with:', body);
});
}

var formatErrorMessage = () => {
  return 'The Talk2M servers have been unreachable for five consecutive attempts.\n\n' +
  '<b>Server Last Reachable At: ' + lastReachableTime + '</b>\n\n' +
  'This application will continue monitoring and will advise when the servers are\n rechable again.'
}

var formatSuccessMessage= () => {
  return 'The Talk2M servers after a period of failure because reachable again. \n\n' +
  '<b>Servers Reachable Again at: ' + lastReachableTime + '</b>\n\n' +
  'Server was unreachable for: ' + duration;
}

initializeApplication();
