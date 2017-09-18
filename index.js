
const cool = require('cool-ascii-faces');
const express = require('express');
const pg = require('pg');
const request = require('request');
const yargs = require('yargs');
const geocode = require('./geocode/geocode');
const weather = require('./weather/weather');
const app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index')
});

app.get('/cool', function(request, response) {
  response.send(cool());
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.get('/times', function(request, response) {
  var result = ''
  var times = process.env.TIMES || 5
  for (i=0; i < times; i++)
    result += i + ' ';
response.send(result);
});

app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
      if (err) { 
        console.error(err); response.send("Error " + err);
       }
      else {
         response.render('pages/db', {results: result.rows} );
     }
    });
  });
});

app.get('/sendPushNotification', function (req, resp) {

  var original = req.query.text;

  console.log(original);

  request(`https://us-central1-fir-cloudmessagingexamples.cloudfunctions.net/sendPushNotification?text=${original}`,
   { json: true },
    (err, res, body) => {
    if (err) {
        return resp.send("Error " + err);
       } else {
        return resp.send("Success");
       }
    console.log(body.url);
    console.log(body.explanation);
  });

});



app.get('/weather', function(request, response) {
   var result = "";
  weather.getWeather(39.9396284, -75.18663959999999, (errorMessage, weatherResults) => {
    
      if (errorMessage) {
        console.log(errorMessage);
        response.send(errorMessage);
      }else {
        console.log(JSON.stringify(weatherResults, undefined, 2));
        result = JSON.stringify(weatherResults, undefined, 2);
        response.send(result);
      }
    
    });
});


