var express = require('express');
var router = express.Router();
var request = require('request');
var path = require('path');
var fs = require('fs')

/* GET users listing. */
router.get('/user', function(req, res, next) {
  res.render('verify', { title: 'User' });
});



module.exports = router;
