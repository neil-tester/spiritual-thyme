// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();

const fs = require('fs');

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  // Generate random number between 0 and 1
  const rand01 = Math.random();
  
  // Transform to between 400 and 600
  const rand400_600 = rand01 * 200 + 400;
  
  // Transform to integer between 400 and 599 inclusive
  const randHttpCode = Math.floor(rand400_600);
  
  // Send as a HTTP status code our random integer between 400 and 599
  response.sendStatus(randHttpCode);
});

app.get('/randomLength', function(request, response) {
  // Generate random number between 0 and 10000000
  const randomNumber = Math.random() * 10000000;
  
  // Create buffer of this number of bytes
  const randomBuffer = Buffer.alloc(randomNumber);
  
  // Set content type
  response.set('Content-Type', 'text/html');
  
  // Send the buffer as the response
  response.send(randomBuffer);
});

app.get('/randomTarget', function(request, response) {
  const websites = [
    'http://www.bbc.co.uk',
    'https://www.google.co.uk',
    'http://en.wikipedia.org',
    'https://www.amazon.co.uk',
    'https://www.ebay.co.uk',
    'https://news.sky.com/uk'
  ]
  
  // Generate random number between 0 and the maximum website array index
  const randomNumber = Math.floor(Math.random() * websites.length);
  
  // Redirect to a random website
  response.redirect(307, websites[randomNumber]);
});

app.get('/randomPenHopOrNot', function(request, response) {
  // Generate random number that's either 0 or 1
  const randomNumber = Math.random() < 0.5 ? 0 : 1;
  
  // Redirect to a different URL based on this random number
  // The URL with www will respond to ICMP.
  // The URL without www won't respond to ICMP and will use PenHop (when TCP is disabled)
  const randomURL = randomNumber === 1 ? 'https://www.microsoft.com' : 'https://microsoft.com';
  response.redirect(301, randomURL);
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

app.get('/randomErrorOrTimeout', function(request, response) {
  const websites = [
    'http://httpstat.us/200?sleep=20000', // Triggers timeout if we timeout after 15 secs
    '/' // redirect to the first app.get above, which returns a HTTP error code
  ]
  
  // Generate random number between 0 and the maximum website array index
  const randomNumber = Math.floor(Math.random() * websites.length);
  
  // Redirect to a random website
  response.redirect(307, websites[randomNumber]);
});

app.get('/evenHighOddLow', function(request, response) {

  // Get the current date and time (e.g. 11th September 2019 13:27:53)
  var now = new Date();
  
  // Get the hours part of the current date and time (e.g. 13)
  const hour = now.getUTCHours();
  
  // If the current UTC+0 hour is odd, then redirect to a 404 error page for a zero quality score (e.g. from 13:00:00 - 13:59:59 UTC+0)
  var redirectUrl = 'http://httpstat.us/404';
  
  // If the current UTC+0 hour is even, then redirect to amazon for a high quality score (e.g. from 12:00:00 - 12:59:59 UTC+0)
  if (hour % 2 === 0){
    redirectUrl = 'https://www.amazon.co.uk/'
  }
  
  // Redirect to the correct website
  response.redirect(307, redirectUrl);
});

app.get('/longEvents', function(req, res) {
  // Get target ID from the URL
  let id = parseInt(req.query.id || 0, 10).toString();
  
  // We want events that are between 6hours and 5days long.
  // After each event stops, we want a new event starting after between 1 and 36 hours since the previous event.
  
  // True for there is an ongoing event (so low score), false for there is no ongoing event (so high score)
  let currentEventStatus = false
  
  // Get the current date and time (e.g. 11th September 2019 13:27:53)
  let now = new Date();
  
  // Get current timestamp (milliseconds since 1970)
  let timestampNow = now.getTime();
  
  // Constants for numbers of milliseconds:
  let ONE_HOUR = 60 * 60 * 1000;
  let SIX_HOURS = 6 * ONE_HOUR;
  let THIRTYSIX_HOURS = 36 * ONE_HOUR;
  let FIVE_DAYS = 5 * 24 * ONE_HOUR;
  
  // // If targets variable isn't defined, then define it
  // if (targets === undefined){
  //   targets = {};
  // }
  
  let targets = JSON.parse(fs.readFileSync('targets.json', 'utf8'));
  
  // If our target index isn't set up then set it up
  if(targets[id] === undefined ){
    targets[id] = {};
  }
  
  // Check if event end date is set for this target
  if (targets[id].endDate){
    if(targets[id].endDate > timestampNow){
      // If event end date is in the future, then we have an ongoing event
      currentEventStatus = true;
    } else {
      // Otherwise, the event needs to stop and we should pick an event start date
      let randomStoppedTime = Math.floor(Math.random() * (THIRTYSIX_HOURS + 1 - ONE_HOUR) + ONE_HOUR);
      
      targets[id].startDate = targets[id].endDate + randomStoppedTime;
      
      // We don't need the end date anymore
      delete targets[id].endDate;
    }
  } else if(!targets[id].startDate || targets[id].startDate < timestampNow){
    // If there is no start date (nor end date), or the start date is in the past, then start the event and pick an end date
    currentEventStatus = true;
    
    let randomDurationTime = Math.floor(Math.random() * (FIVE_DAYS + 1 - SIX_HOURS) + SIX_HOURS);
    
    targets[id].endDate = timestampNow + randomDurationTime;
    
    // We don't need the start date anymore
    delete targets[id].startDate;
  }
  
  // Otherwise, if the start date is in the future, then we do nothing and there is no ongoing event
  
   
  // If we want an ongoing event, then redirect to a 404 error page for a zero quality score (e.g. from 13:00:00 - 13:59:59 UTC+0)
  var redirectUrl = 'http://httpstat.us/404';
  
  // If we don't want an ongoing event, then redirect to amazon for a high quality score (e.g. from 12:00:00 - 12:59:59 UTC+0)
  if (!currentEventStatus){
    redirectUrl = 'https://www.amazon.co.uk/'
  }
  
  // Redirect to the correct website
  res.redirect(307, redirectUrl);
  
  // Write targets JSON to file
  let jsonContent = JSON.stringify(targets);
  fs.writeFileSync('targets.json', jsonContent, 'utf8');
});

app.get('/longEventsData', function(req, res) {
  // Get target ID from the URL
  //let id = parseInt(req.query.id || 0, 10).toString();
  
  let displayText = '';
  
  let targets = JSON.parse(fs.readFileSync('targets.json', 'utf8'));
  
  Object.keys(targets).forEach( id => {
    let startDate;
    let endDate;
    
    if(targets[id].startDate){
      startDate = new Date();
      startDate.setTime(targets[id].startDate);
    }
    
    if(targets[id].endDate){
      endDate = new Date();
      endDate.setTime(targets[id].endDate);
    }

    displayText += '<br /><br />Target ID: ' + id;
    displayText += '<br />startDate: ' + startDate;
    displayText += '<br />endDate: ' + endDate;
  });
  
  res.send(displayText);
});
