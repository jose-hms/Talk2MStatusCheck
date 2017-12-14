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

//Required application variables.
let failedLogins = 0; //Keep track of the number of failed attempts.
let lastReachableTime = null; //Keep a running count of when the server was last reachable
let failedFlag = false; //Boolean to determine it failed once so we can notify users

/*
This subscription to the timer is what actually triggers the Talk2M check.
On completion of the countdown the application will attempt to log in to Talk2M.
If successful it will log the time and keep the timer going at 5 minute intervals.
If failed it will log an error in the counter and set the timer to 30 second checks.
If the application fails on teh 30 second checks 5 times in a row a notification is
sent to the eWON support team.
*/
let timerSetup = () => {
  timer.subscribe((times, parameters) => {
    if(timer.isFinal()){
      talk2mCheck().then((response) => {
        if(response){
          if(failedFlag){
            sendAlert(formatSuccessMessage).then((response) => {
              return true;
            }).catch((error) => {
              return false;
            });
          }
          failedLogins = 0;
          lastReachableTime = moment().format('MMMM Do YYYY, h:mm:ss a');;
          updateTime(0,5,0);
        }
      }).catch((error) => {
        console.log(error);
        failedLogins++;
        if(failedLogins === 5){
          sendAlert(formatErrorMessage).then((response) => {
            return true;
          }).catch((error) => {
            return false;
          });
        }
        updateTime(0,0,30);
      })
    }
  });
}

//To keep credentials secure a separate .json file will be added to the server.
//It will not be committed here.
var userCredentials = JSON.parse(fs.readFileSync('user.json'));
let devId = userCredentials.developerId;
let account = userCredentials.account;
let user = userCredentials.username;
let pass = userCredentials.password;

//Simple api query to log in to Talk2M. Resolves with pass or fail (true/false)
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

//API request to hms.how to send a notification to users .
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
});
}

//Format the error message when server unreacable.
var formatErrorMessage = () => {
  return 'The Talk2M servers have been unreachable for five consecutive attempts.\n\n' +
  '<b>Server Last Reachable At: ' + lastReachableTime + '</b>\n\n' +
  'This application will continue monitoring and will advise when the servers are\n rechable again.'
}

//Format success message when server is reachable.
var formatSuccessMessage= () => {
  return 'The Talk2M servers after a period of failure because reachable again. \n\n' +
  '<b>Servers Reachable Again at: ' + lastReachableTime + '</b>\n\n' +
  'Server was unreachable for: ' + duration;
}

initializeApplication();
