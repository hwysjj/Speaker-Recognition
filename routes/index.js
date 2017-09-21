var express = require('express');
var request = require('request');
var path = require('path');
var fs = require('fs');
var router = express.Router();

/* GET home page. */
router.get('/signup', function(req, res, next) {
  res.render('index', { title: 'Sign Up' });
});
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Sign Up' });
});
router.get('/dashboard', function(req, res, next) {
  res.render('dashboard', { title: 'Dashboard' });
});
router.get('/identification', function(req, res, next) {
  res.render('identification', { title: 'Payment Offline' });
});
router.get('/summary', function(req, res, next) {
  res.render('summary', { title: 'Done' });
});
router.get('/user', function(req, res, next) {
  res.render('verify', { title: 'User' });
});

router.post('/enroll', function(req, res, next) {
  var data = new Buffer(req.body.url, 'base64');
  request.post({
    url: `https://westus.api.cognitive.microsoft.com/spid/v1.0/identificationProfiles/${req.body.id}/enroll?shortaudio=true`,
    body: data,
    headers:{
      "Ocp-Apim-Subscription-Key":"9630458358cb45f5b84e84183200b897"
    }
  }, function (e,r,body){
    if(r.statusCode !== 202) {
      var data = JSON.parse(body);
      res.sendStatus(403);
    } else {
      var enrollmentinfo = {
        profileid: req.body.id,
        user: JSON.parse(req.body.userInfo)
      };
      setTimeout(function(){
        retreivestatus(r.headers['operation-location'], res, 'enroll', enrollmentinfo)
      }, 3000);
    }

  });
});

router.post('/verify', function(req, res, next) {
  var data = new Buffer(req.body.url, 'base64');
  readData(function(userList){
    var profileids = [];
    profileids = userList.map(x => x.profileid);
    request.post({
      headers:{
        "Ocp-Apim-Subscription-Key":"9630458358cb45f5b84e84183200b897"
      },
      body: data,
      url:`https://westus.api.cognitive.microsoft.com/spid/v1.0/identify?identificationProfileIds=${profileids.toString()}&shortaudio=true`
    },function(e, r, body){
      if(r.statusCode === 202) {
        setTimeout(function(){
          retreivestatus(r.headers['operation-location'], res, 'indentification', userList)
        }, 3000);
      } else {
        res.sendStatus(403);
      }
    }
  );
  });

});

function readData(callback){
  // read json datas
	fs.readFile(path.join(__dirname, 'data.js'),{encoding:'utf-8'}, function (err,bytesRead) {
    if (err) throw err;
    var data = bytesRead.split(';')
    var userList = [];
    for(var i = 0; i < data.length - 1; i++) {
      var item = JSON.parse(data[i]);
      userList.push(item);
    }
    callback(userList);
  });
}

function retreivestatus(location,res, type, enrollmentinfo) {
  request.get({
    url: location,
    headers:{
      "Ocp-Apim-Subscription-Key":"9630458358cb45f5b84e84183200b897"
    },
  }, function (e, r, body) {
    var number = 15;
    if(r.statusCode === 200) {
      body = JSON.parse(body);
      if (body.status && body.status === "succeeded"){
        if(type === 'enroll' && body.processingResult.enrollmentStatus === 'Enrolled') {
          // save data to file
          fs.appendFile(path.join(__dirname, 'data.js'), JSON.stringify(enrollmentinfo)+';', function (err) {
            if (err) throw err;
            res.sendStatus(200);
          });
        }
        else if(type === 'indentification' && body.processingResult.enrollmentStatus === 'Enrolling' ) {
          setTimeout(function(){
            number--;
            if(number > 0) {
              retreivestatus(location,res, type, enrollmentinfo);
            }
          }, 3000);
        }
        else if(type === 'indentification' && body.processingResult.identifiedProfileId !== '00000000-0000-0000-0000-000000000000'&& body.processingResult.confidence === 'High') {
            var profiles = [];
            profiles = enrollmentinfo.filter(x => {
              return x.profileid === body.processingResult.identifiedProfileId
            });
            if(profiles && profiles[0]) {
              res.send(profiles[0].user);
            } else {
              res.sendStatus(403);
            }
        } else {
          res.sendStatus(403);
        }
      } else if(body.status && body.status === "running") {
        setTimeout(function(){
          number--;
          if(number > 0) {
            retreivestatus(location,res, type, enrollmentinfo);
          }
        }, 3000);
      } else {
        res.sendStatus(403);
      }
    }
    else {
      res.sendStatus(403);
    }

  });
}

module.exports = router;
